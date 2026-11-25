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
1. 太短的处理
2. 太长的处理
  截断（大部分）
  输出到最后一个的时候只保留eos是非-inf，但现在llm没人用了

为啥之前要那么做？


## no-repeat-ngram
看下要讲么？

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



