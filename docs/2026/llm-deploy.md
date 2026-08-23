# 【AI】大模型的部署和量化（未完成）
部署即在本地电脑中下载并运行模型，并使用这个模型进行推理。

## Ollama
Ollama是一个大模型部署工具，用它只需要执行几个命令，就可以在本地电脑下载和部署大模型。官网列出了非常多可以部署的模型，有官方模型，也有用户训练/调整过的模型。

### 使用Ollama部署
首先安装Ollama本身，然后执行命令行。这里我们以Qwen3:0.6B为例进行安装，因为这是一个非常小的模型，大部分电脑都可以轻松部署。

```sh
# 下载模型到本地
ollama pull qwen3:0.6b

# 列出本地下载的模型
ollama list
# 输出结果
  # NAME          ID              SIZE      MODIFIED
  # qwen3:0.6b    7df6b6e09427    522 MB    50 seconds ago
# 列出本地下载的模型
ollama show qwen3:0.6b
# 输出结果
  # Model
  #   architecture        qwen3
  #   parameters          751.63M
  #   context length      40960
  #   embedding length    1024
  #   quantization        Q4_K_M
  #   ...部分内容省略
```

可以看到，我们下载了Qwen3:0.6B的模型，这个模型是Ollama自己提供的。模型是Q4_K_M量化，即主要使用4bit表示一个参数，但重要的位置会采用更高的精度。模型文件大小是522MB，上下文为40960，也就是40K。然后我们运行这个模型：

```sh
# 运行模型
ollama run qwen3:0.6b
```

运行模型后，命令行就进入多轮对话模式，我们可以直接与这个模型进行交流。最后输入/bye退出。

​![](/2026/llm-deploy-1.png)

### HTTP接口形式
使用前面的run命令，或者直接使用serve命令，可以开启本地的HTTP服务，通过接口可以调用模型。

```sh
# 开启本地模型HTTP服务
ollama serve
# 测试HTTP服务，发送请求
Invoke-RestMethod -Uri "http://localhost:11434/api/chat" -Method Post -Body '{"model":"qwen3:0.6b","messages":[{"role":"user","content":"你好"}],"stream":false}' -ContentType "application/json"
# 输出结果
  # model                : qwen3:0.6b
  # created_at           : 2026-08-18T16:30:26.4658699Z
  # message              : @{role=assistant; content=好的，我理解您的需求。如果您有其他问题或需要帮助，请随时告诉我，我会尽力解答。如果需要帮助，请告诉我您想询问的内容。; thinking=Okay, the user is asking in Chinese, but the original message is in English. ...省略 }
  # done                 : True
  # done_reason          : stop
  # total_duration       : 29896113900
  # load_duration        : 296963600
  # prompt_eval_count    : 17
  # prompt_eval_duration : 37064000
  # eval_count           : 834
  # eval_duration        : 29539272000
```

Ollama默认在11434端口提供服务。通过结果可以看到，模型成功的给通过HTTP接口给出了回复。但/api/chat接口的协议是Ollama自己的，Ollama也有提供其它更通用的协议，例如OpenAI的，这样可以方便接入其它Agent。这里我们尝试将其接入OpenCode，模型API接入配置填写如下：

```sh
base_url='http://localhost:11434/v1/',
api_key='ollama'
model='qwen3:0.6b'
```

然后就可以在Agent中使用这个模型了。但是由于模型太小，只有0.6B，基本无法理解Agent注入的提示词，因此基本无法完成功能。而且如果本地电脑配置不高（例如没有显卡的Windows电脑），那么回复会非常慢。例如下图左侧是Qwen3:0.6b的回复，右侧是DeepSeek V4 Flash的回复，左侧都直接把工具提示词回答了出来，右侧则准确的完成了任务，列出了项目中的文件。

​![](/2026/llm-deploy-2.png)

## 使用Python运行
人工智能开发的主要语言是Python，上面Pytorch等丰富的人工智能工具和库，因此如果了解大模型，那么还是要使用Python尝试运行。

### 下载模型和工具包
这里我们使用国内的魔搭下载，模型地址：https://www.modelscope.cn/models/Qwen/Qwen3-0.6B 。这里下载的并不是模型经过量化后的版本，而是原始发布的模型本身，可以看到是Safetensors格式的，编码精度为BF16。

```sh
# 安装魔搭
pip install modelscope
# 下载模型到指定目录
modelscope download --model Qwen/Qwen3-0.6B --local_dir ./Qwen3-0.6B
```

下载之后在模型中可以看到多个文件，其中model.safetensors表示模型权重文件，所有的参数都在这个文件中。由于是BF16格式，一个参数用两个字节表示，因此文件大小约为1.4GB。模型中还有一些配置文件，词表文件和分词规则等等，这里先不介绍了。

```sh
# torch为PyTorch，是最流行的深度学习框架库
pip install torch
# transformers是Hugging Face的大模型工具库
pip install transformers
# transformers的可选依赖，用于自动适配不同硬件
pip install accelerate 
```

### 加载模型

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

# 模型目录
MODEL_DIR = "./Qwen3-0.6B"

# 加载分词器
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)

# 加载模型：Auto 根据 config.json 自动识别架构（Qwen3ForCausalLM）
model = AutoModelForCausalLM.from_pretrained(
    MODEL_DIR,
    torch_dtype="auto",  # 按模型配置自动选择精度（此处为 bfloat16）
    device_map="auto",   # 自动分配到可用设备（GPU，无则 CPU）
)

print(tokenizer)
print(model)
```

可以看到，通过简单的两句代码即可加载模型。其中transformers内置了很多开源大模型的适配工具，他会识别模型配置文件，自动选择合适的模型处理方式。输出结果如下：

​![](/2026/llm-deploy-3.png)

其中第一句话为模型加载的进度条，如果电脑性能较差，可能要花费一段时间才能加载完成。Qwen2Tokenizer是加载的分词器，叫做Qwen2是因为Qwen3和2使用了相同的分词方案，中间列出了一些参数和特殊用途的token表。Qwen3ForCausalLM是Qwen3的模型结构，其中输出了词嵌入层，28层解码器等模型的大致结构。Qwen2Tokenizer和Qwen3ForCausalLM都是transformers内置的，通过识别模型配置文件自动应用。

### 多轮对话

```python
# 对话历史列表
messages = []

while True:
    # 读取用户输入，输入 exit 退出循环
    user_input = input("\n你：")
    # 去除字符串首尾空白
    if user_input.strip() == "exit":
        break

    # 把用户消息加入历史对话中
    messages.append({"role": "user", "content": user_input})

    # 将历史对话按 Qwen3 模板转为纯文本
    # add_generation_prompt 在消息末尾附加模型回复的开始标记
    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True, return_tensors="pt"
    )
    # 将文本编码为输入TokenID的列表(PyTorch tensor 格式)
    model_inputs = tokenizer(text, return_tensors="pt")

    # 其余采样参数取模型默认配置
    # max_new_tokens=512 最多生成 512 个新 token
    outputs = model.generate(**model_inputs, max_new_tokens=512)

    # 解码出新增部分（去掉输入部分），跳过特殊 token
    response = tokenizer.decode(
        outputs[0][len(model_inputs["input_ids"][0]):], skip_special_tokens=True
    )
  
    # 把模型回复加入历史，用于下一轮对话的上下文
    messages.append({"role": "assistant", "content": response})

    print("模型：" + response)
```

读取模型后，使用上面代码可以实现多轮对话，效果如下图：

​![](/2026/llm-deploy-4.png)

下面我们来逐步分析代码。首先是一个无限循环，读取用户输入，如果输入为exit则退出。然后输入被放到messages中，它存放着历史用户输入(role为user)和模型输出(role为assistant)的对话历史。例如当进行第三轮对话时，内容是这样的（太长的部分已省略）：

```json
[
  { "role": "user", "content": "你好" },
  {
    "role": "assistant",
    "content": "<think>\n好的，用户发来“你好”，我需要 ...省略\n</think>\n\n你好！有什么可以帮助你的吗？ 😊"
  },
  { "role": "user", "content": "你是谁" },
  {
    "role": "assistant",
    "content": "<think>\n好的，用户问“你是谁”，我需要 ...省略\n</think>\n\n我是...省略。有什么可以帮助您的吗？ 😊"
  },
  { "role": "user", "content": "天空为什么是蓝色的" }
]
```

messages的格式实际也是分词器要求的格式。首先使用分词器将messages套入模型对话模板，处理成纯文本。大模型实现多轮对话时如果需要理解上下文，需要将前面的对话也一并读取，因此这里是所有历史记录。下面是处理之后text的输出：

```sh
# 一轮对话text值
<|im_start|>user
你好<|im_end|>
<|im_start|>assistant

# 二轮对话text值
<|im_start|>user
你好<|im_end|>
<|im_start|>assistant
你好！有什么可以帮助你的吗？😊<|im_end|>
<|im_start|>user
你是谁<|im_end|>
<|im_start|>assistant
```

注意这里分词器将模型思考内容`<think></think>`省略了。因此思考内容太长且保存意义不大。而且发现我们内容前后有一些特殊符号，这些是模型的对话模板格式，有消息开始/结束标记，角色标记等。不同的模型对话模板是不一致的。然后就是真正的分词，将文本分割为一个一个的token，然后转化为TokenID。输出outputs内容如下：

```json
{'input_ids': tensor([[151644,872,198, 108386, 151645,198,151644,77091,198]]), 'attention_mask': tensor([[1, 1, 1, 1, 1, 1, 1, 1, 1]])}
```

input_ids中是一个PyTorch tensor 格式的TokenID列表，对照模型文件中的词表可以将其转换为前面的文本。之所以是二维结构和有attention_mask，是因为它可以适配批量输入不同对话同时进入模型，这里我们使用不到因此忽略。下一步就是调用模型生成回复了，输入中`**model_inputs`是Python解包，将上述的结构解开后作为函数的入参。输出outputs结果如下：

```json
tensor([[151644,    872,    198, 108386, 151645,    198, 151644,  77091,    198,
         151667,    198,  99692,   3837,  20002,  28291,  36407,  99593, 100908,
         ...省略
      ]])
```

可以看到输出也是TokenID列表，而且注意观察，输出中是包含了输入的TokenID列表的。因此下面将tokenID解析为文本前，需要将输出中的输入部分去掉再解析，这里说明一下去掉的过程。

```python
outputs
# tensor([[xxx, xxx, ...]]) 输出TokenID二维列表 
outputs[0]
# [xxx, xxx, ...] 输出列表的第一行，也是实际有数据的那行

model_inputs
# {'input_ids': tensor([[xxx, xxx, ...]]) ... } # 输入结构
model_inputs["input_ids"]
# tensor([[xxx, xxx, ...]]) 输入TokenID二维列表 
model_inputs["input_ids"][0]
# [xxx, xxx, ...] 输入列表的第一行，也是实际有数据的那行
len(model_inputs["input_ids"][0])
# 9 输入列表的第一行的长度
len(model_inputs["input_ids"][0]):
# 9: Python语法，可以将数组内部分内容截取

outputs[0][len(model_inputs["input_ids"][0]):]
# 将outputs[0]的第9到最后一个元素截取出来
```

通过上面的语法，去掉输入部分，只将这次模型输出的TokenID截取出来，然后再给分词器进行解码，同时去掉模板标记的特殊字符，最后生成的response，就是模型输出的文本，也就是我们前面看到的结果了。

## 格式和量化
虽然都是同一个大模型Qwen3:0.6B，但前面使用Ollama部署的模型格式和使用transformers加载的模型格式和文件大小是不相同的，这与模型存储格式与量化精度有关。

### 存储格式
存储格式主要与运行模型的训练框架有关，不同框架使用不同的存储格式。

| 存储格式 | 对应框架 | 使用场景 |
| - | - | - |
| Safetensors | transformers | 最常用的格式 |
| GGUF | llama.cpp | Ollama等工具使用 |
| ONNX | ONNX Runtime | 跨平台部署使用 |
| .pt .pth .bin | PyTorch | 训练中使用 |
| .ckpt .pb | TensorFlow | 训练中使用 |

* pt和pb都是训练中使用的格式，并不直接作为大模型存储分发的数据格式。
* Safetensors是存粹的数据格式，即里面放的都是权重数据本身，不包含可执行代码。还需要单独的模型配置文件，分词器，对话模板等。
* GGUF里面还可以包含分词器，对话模板，模型配置文件等数据。
* ONNX不仅包含权重，还包含了模型结构定义（计算图），但不包含分词器对话模板等。由于包含了模型结构，因此直接使用ONNX运行时即可运行模型。其他的格式都需要框架本身内置模型结构，例如前面的Qwen3ForCausalLM就是transformers中内置的模型结构。

### 量化精度
在之前的[【AI】一文读懂大模型生态：分类/参数/结构/训练/GPU/评测/排行/社区](https://jzplp.github.io/2026/llm-stru.html)文章中，我们了解到大模型参数量巨大，运行时一般放到GPU内存（即显存）中，显存一般和GPU都是整体的，非常贵，不像内存可以独立添加更换。因此为了节约显存或提高运算速度，将参数的存储位数压缩，同时希望压缩后的数字与压缩前的区别尽量小，这就是量化的含义。

基础的量化精度格式是通用的，基本在所有的存储格式和机器上都能运行。但有一些量化精度格式是部分存储格式专用的，里面有特定的算法处理。还有一些精度格式需要特殊的指令集才能处理，因此只有部分较新的机器才能运行。首先来看看通用的量化精度：

| 精度格式 | 位数 | 适配存储格式 | 适配机器 |
| - | - | - | - |
| FP32 | 标准32位浮点数 | 通用 | 通用 |
| FP16 | 标准16位浮点数 | 通用 | 通用 |

前面FP32和FP16是两个基础格式，实际上就是原样存储对应位数的浮点数。但这两个格式占用内存空间很大，如果希望每个数字占用空间更小，且还能保证数值和原来近似就要因此公共缩放因子了。

| 精度格式 | 位数 | 适配存储格式 | 适配机器 |
| - | - | - | - |
| INT8 | 8位整数+公共缩放因子 | 通用 | 通用 |
| INT4 | 4位整数+公共缩放因子 | 通用 | 通用 |

公共缩放因子是很多个数字共享的。使用INT8和INT4时，需要将整数部分*缩放因子，即可还原出原来的数字。但可想而知，使用这种方式存储的数字会有误差损失。








## 自己做量化


## 参考
- Ollama\
  https://ollama.com/
- Ollama qwen3:0.6b\
  https://ollama.com/library/qwen3:0.6b
- Ollama文档 api/chat\
  https://docs.ollama.com/api/chat
- Ollama文档 OpenAI compatibility\
  https://docs.ollama.com/api/openai-compatibility
- 【AI】一文读懂大模型生态：分类/参数/结构/训练/GPU/评测/排行/社区\
  https://jzplp.github.io/2026/llm-stru.html
- 魔搭社区\
  https://www.modelscope.cn/
