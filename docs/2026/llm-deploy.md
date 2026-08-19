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


## 模型量化和格式

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
