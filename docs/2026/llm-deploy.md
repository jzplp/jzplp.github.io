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





### 提供API

使用HTTP接入AGENT部署。（但是模型太小跑不起来）

## 直接用python运行

## 模型量化和格式

## 自己做量化


## 参考
- 魔搭社区\
  https://www.modelscope.cn/、
- Ollama\
  https://ollama.com/
- Ollama qwen3:0.6b\
  https://ollama.com/library/qwen3:0.6b
