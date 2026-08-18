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
