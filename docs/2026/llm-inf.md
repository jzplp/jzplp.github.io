# 【AI】大模型推理时的置-inf屏蔽（未完成）

## 置-inf和单token处理
大模型推理时，深度神经网络输出的logits值经过一系列处理后，总中选择一个作为值，它所对应的向量下表，就是输出的tokenid。但因为各种原因，可能是为违禁词，可能是品牌名，可能是输出长度控制，可能是特殊的结构化数据等，这些原因导致模型需要禁止当前输出某些token。最常见的方法就是“置-inf”，即拿到logits之后，将我们不希望输出的tokenId对应的logit值设置为-inf。

由于e^{-inf} = 0，因此后面的softmax函数中，无论其它logit的值是多少，被置为-inf的logit值概率必定为0，因此实际上它就被排除出在候选token之外。通过这种方式，可以让模型避免输出对应的token，实现屏蔽的效果。

在不同方法的作用下，置inf可以实现不同的应用效果。首先我们来看一下最简单的方法，即“单token处理”。具体操作为：

1. 预先准备好一个屏蔽token表，例如 [你好, 苹果, 安卓]
2. 对照大模型token词表，找出对应的tokenId，整理成id表 [123, 545, 45768]
3. 大模型推理时，输出的logits先过一遍id表，下标满足对应的id，logit值就置为-inf

其中前两步可以提前做好，大模型直接引用id表，并不需要每次大模型推理时才查一遍。

这种方式非常简单，一般用在屏蔽模型特殊功能token，单个token就可以处理的禁止词，品牌版权词，合规性等等。例如需要屏蔽模型特殊功能token可能有 <|im_start|> 消息起始标记，<|endoftext|> 序列填充值等等。但大部分禁止词都是包含多个token的，不能单纯使用token表处理，我们将在后面介绍处理方法。

## EOS控制
### EOS标记
EOS的全称是End-of-Sequence，中文名为“序列结束”，指的是大模型中表示一段文本结束的标记。不同模型的EOS标记不同，这里列举下Qwen3的EOS标记：

| tokenId | 对应文本 | EOS级别 |
| - | - | - |
| 151643 | <\|endoftext\|> | 文档级EOS |
| 151645 | <\|im_end\|> | 对话级EOS |

Qwen3的EOS标记有两种，其中文档级EOS主要是训练时使用的。训练时模型会接收大量的文档，其中每个文档最后被加上文档级EOS表示，表示当前文档结束，后面的新文档内容和EOS之前的文档内容无关。

对话级EOS则是对多轮对话中的问题和答案结束进行标记，大模型用它来标识当前的用户提问和模型回答是否结束。这些特殊标记只在模型内部使用，在给用户展示前会过滤处理，因此我们使用时看不到这些标记。Qwen3的对话模板的简化版是这个样子：

```
<|im_start|>system
你是AI助手，帮助用户解决问题<|im_end|>
<|im_start|>user
你好<|im_end|>
<|im_start|>assistant
你好！有什么可以帮你的？<|im_end|>
<|im_start|>user
今天天气怎么样<|im_end|>
<|im_start|>assistant
今天天气晴朗，气温较热。<|im_end|>
<|im_start|>user
谢谢<|im_end|>
<|im_start|>assistant
不客气！<|im_end|>
```

其中system表示给AI的“系统提示”，一般表示AI的身份和作用；user表示用户的提问；assistant表示AI的回答。可以看到提问和回答后面都有<|im_end|>，这就是对话级EOS。我们与AI的对话，就是先被转换成这种文本格式，然后再传给大模型进行推理的；模型给出的回答也是这种格式，需要工具解析才能拿到回答文本。这种工具叫tokenizer，中文一般称作分词器。

### 模型输出EOS
用户输入问题，模型进行回答时，模型应该如何控制自己的输出是否结束呢？就是使用EOS。确切的说，是模型自身输出EOS这个token，表示自己已经回答完毕了。推理引擎看到EOS标记，边不再继续让模型生成token，而是把回答返回给用户。

虽然在多轮对话中，我们主要使用对话级EOS，但实际应用时，两个EOS标记都可以作为结束标记使用。假设模型再回答中输出了文档级EOS，推理引擎也会认为模型回答结束。推理引擎是支持配置生效的EOS标记的，Qwen3模型的配置在generation_config.json中的eos_token_id属性，通过文件内容可以看到就是配置了前面两个EOS的tokenId。

可以看到对话模板中实际上不只有EOS这一个特殊标记，实际上特殊标记有好多种，而且都不是提供给用户看的。分词器负责对话模板拼合与对话数据之间的转换，我们在[【AI】大模型本地部署与量化：Ollama、transformers、llama.cpp实践](https://jzplp.github.io/2026/llm-deploy.html)文章中，本地启用大模型进行推理时，就做过这种转换，这里我们再将转换代码列出：

```python
# 对话历史列表
messages = [
    {"role": "system", "content": "你是AI助手，帮助用户解决问题"},
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "你好！有什么可以帮你的？"},
    {"role": "user", "content": "今天天气怎么样"},
    {"role": "assistant", "content": "今天天气晴朗，气温较热。"},
]
while True:
    # 用户输入问题
    user_input = input("\n你：")
    # 把用户问题加入历史对话中
    messages.append({"role": "user", "content": user_input})
    # 将历史对话按 Qwen3 模板转为文本
    # tokenize=False 把 messages 渲染成文本字符串，不转成 token id
    # add_generation_prompt=True 在末尾自动补上 <|im_start|>assistant\n
    text = tokenizer.apply_chat_template(
        messages, tokenize=False, add_generation_prompt=True,
    )
    # 将文本编码为输入TokenId的列表
    # return_tensors="pt" 生成 PyTorch tensor 格式数据
    model_inputs = tokenizer(text, return_tensors="pt")
    # 模型推理生成回答
    outputs = model.generate(**model_inputs, max_new_tokens=512)
    # 解码出新增部分（去掉输入部分），跳过特殊 token
    response = tokenizer.decode(
        outputs[0][len(model_inputs["input_ids"][0]):], skip_special_tokens=True
    )
    # 把模型回复加入历史，用于下一轮对话的上下文
    messages.append({"role": "assistant", "content": response})
```

通过代码可知，我们保存的对话数据并不是对话模板提供的数据，而是一个包含一条一条问答的list，其中并没有任何特殊标记。tokenizer.apply_chat_template方法将list套入对话模板生成文本格式的数据，再转换为tokenId列表提供给大模型。tokenizer.decode接收模型输出的tokenId列表，转换为文本。前面代码中我们控制只解析了模型输出部分，且跳过了特殊标记token。

通过前面代码也可以看出，虽然特殊标记不能跨模型使用，但经过分词器处理后，我们拿到的对话数据messages不包含任何一个特殊标记，这份数据是完全可以提供给其它模型进行处理和回答。

因此我们也获得了跨模型对话的能力，即A模型的对话历史给B模型，B模型也可以正常读取对话历史并继续回答。例如OpenCode等Agent提供了对话中切换模型的能力，同一个上下文可随时切换模型回答。不过这时候系统提示依然是“对话中第一个模型”的，因此新模型可能并不知道自己是被“切换”后才来回答的，甚至可能将自己误认为是第一个模型。

### 输出长度控制
在大模型推理时，经常开启输出token的长度控制，防止模型过早停止或者一直不停的输出。一般有最大长度和最小长度两种控制，实现都非常简单。例如前面的推理代码中，就包含了max_new_tokens这个最大输出长度控制。

首先描述输出最小长度控制，流程为：每次输出时判断当前输出token序列长度，如果大于最小长度，则不做处理。如果小于最小长度，则将EOS这个token对应的logit值设置为-inf，使其输出的概率为0，无法被选中。使用python形式的伪代码流程如下：

```python
# EOS的tokenId
EOS_IDS = [151643, 151645]
# 最小长度
MIN_LENGTHS = 512
# 输出token序列
output_token = []

while True:
  # 生成logits
  logits = gen_logits()
  # 如果小于最小长度
  if len(output_token) < MIN_LENGTHS:
    # EOS对应的logit赋值-inf
    logits[EOS_IDS] = -torch.inf
  # 获取tokenId
  token_id = get_token(logits)
  # 模型输出EOS，终止输出
  if token_id in EOS_IDS:
    break
  # 放入输出序列
  output_token.append(token_id)
```

然后再说最大长度控制。这个就更简单了，到长度了直接截断，不再继续生成即可。这是大部分推理引擎的做法。伪代码形式如下：

```python
# EOS的tokenId
EOS_IDS = [151643, 151645]
# 最大长度
MAX_LENGTHS = 512
# 输出token序列
output_token = []

while True:
  # 生成logits
  logits = gen_logits()
  # 获取tokenId
  token_id = get_token(logits)
  # 模型输出EOS，终止输出
  if token_id in EOS_IDS:
    break
  # 放入输出序列
  output_token.append(token_id)
  # 如果等于最大长度，便不再继续输出
  if len(output_token) >= MAX_LENGTHS:
    break
```

transformers还支持另外一种截断方式，它并不是到了长度截断，而是在MAX_LENGTHS - 1长度的时候，模型正常输出将logits。然后将其中表示非EOS标记的值都置为-inf，EOS标记对应的logit值设置为0。经过softmax函数时，非EOS标记的概率为0，EOS标记的概率为非0。这样模型最后一个输出token必然是EOS标记，也就是实现了终止输出的效果。伪代码形式如下：

```python
# EOS的tokenId
EOS_IDS = [151643, 151645]
# 最大长度
MAX_LENGTHS = 512
# 输出token序列
output_token = []

while True:
  # 生成logits
  logits = gen_logits()
  # 当前距离最大长度为1
  if len(output_token) + 1 >= MAX_LENGTHS:
    # logits全部值设置为-inf
    logits[:] = -torch.inf
    # EOS对应的logit赋值0
    logits[EOS_IDS] = 0
  # 获取tokenId
  token_id = get_token(logits)
  # 模型输出EOS，终止输出
  if token_id in EOS_IDS:
    break
  # 放入输出序列
  output_token.append(token_id)
```

这种方式实际上让模型多做了一次没用的前向计算。虽然在实际大规模推理场景中，都是一批batch并行处理的，多算一步也不会怎么浪费性能，但看起来确实有点奇怪。在大模型时代之前，模型参数量和硬件要求没这么大，多算一步也无所谓。但现在基本所有模型都不会使用这种方式，即使在transformers中也是默认关闭的。

另外transformers不一样的一点是，transformers中的max_length配置指的是输入问题（+对话上下文）和回答一起的总长度，而其它推理引擎使用的max_tokens配置一般都指的是纯输出长度。transformers如果希望指定纯输出长度，需要使用max_new_tokens配置。

## no-repeat-ngram
### 方法介绍
no-repeat-ngram的含义是禁止重复n-gram，n-gram表示长度为n的序列，可以是词，也可以是字母，在大模型场景中指的就是token，即长度为n的token序列不允许出现重复。它是绝对“不允许出现”，但不管是代码，还是创意文本，都存在重复但是需要输出的场景，因此no-repeat-ngram方法在大模型时代已经基本不被采用了。但它的实现比较简单，思路有可借鉴之处，也切合本文主题（置-inf），因此我们还是学习一下它的方法。

首先提前设置一个常数n，表示禁止重复的序列长度。在实际使用中一般取值3或4。5以上的值一般较难触发，意义不大。依然是在大模型推理时，每次新生成logits值之后处理：

1. 取模型最后生成的，长度为n-1的token序列。
2. 在模型生成的序列中，查找是否存在这个长度为n-1的重复的子token序列（除了最后生成的那个，那就是它自己）。
3. 如果能找到，则将重复的子token序列的后面一个token记录下来，最后形成一张token表。
4. 将这个token表中对应token的logit值设置为-inf，使其无法被选中，最后也就无法生成长度为n的重复token序列。

下面以n=3和一个实际的输出序列为例，画出了no-repeat-ngram的处理方法流程：

​![](/2026/llm-inf-1.png)

可以看到，方法确实非常简单，实际的效果就是“根本不允许长度为n的重复子串出现”。这种硬性屏蔽太过严厉，并不符合应用场景要求。因此模型一般使用之前介绍过的惩罚项来优化模型输出重复内容的问题。惩罚项虽然也降低模型输出重复内容的概率，但并不会完全禁止，是“软性惩罚”，在应用中比no-repeat-ngram要更合理。

### 算法优化
no-repeat-ngram方法实际应该怎么求解呢？首先我想到的方法就是，每次生成token时，从输出序列头开始，一个子串一个子串的向后匹配，注意匹配时是在原串上进行遍历，无需创建新子串。设输出序列长度为L，生成token次数为M，no-repeat-ngram方法的n值为N。伪代码如下：

todo 伪代码

这种方法需要的时间复杂度和空间复杂度为：

todo 复杂度

可以看到，这个任务实际上就是子串匹配，这个任务是有成熟的时间复杂度优化算法的，比如KMP（找下别的）。

todo 伪代码

todo 复杂度

但事实上使用的是增量子串构建+hash方法匹配。这个方法的伪代码：

todo 伪代码

todo 复杂度

由于N的取值一般比较小，因此N直接作为复杂度常数项即可。这样几种方法的复杂度如下：

todo 复杂度

由于xx原因，最后用xx方法

## 禁用词字典树
包含AC自动机？

## 约束解码

## 总结

从简单到难的描述，
每个描述使用方法，原理，举例，应用场景

## 参考
- 【AI】大模型推理解码全解析：惩罚项、温度、截断与采样\
  https://jzplp.github.io/2026/llm-inference.html
- 【AI】大模型本地部署与量化：Ollama、transformers、llama.cpp实践\
  https://jzplp.github.io/2026/llm-deploy.html



