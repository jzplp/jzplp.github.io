# 【AI】大模型LoRA微调（未完成）
todo 简单介绍

## 前置数学基础
人工智能相关算法中，包含很多的数学知识，其中更是包含大量矩阵操作。虽然上学的时候学过，但已经忘了不少。因此这里再简单复习一下下文中会用到的一些数学知识。

### 矩阵乘法
一个M×N的矩阵$A_{M \times N}$，一般表示M行N列。例如下面为三行两列的矩阵$A_{3 \times 2}$，每个元素$a_{ij}$表示这个元素在第i行，第j列。

$$
\begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \\ a_{31} & a_{32} \end{bmatrix}
$$

矩阵和矩阵之间可以进行运算，其中矩阵加法就是要求矩阵行列相同每个元素相加，矩阵相乘则麻烦一点。两个矩阵相乘，要求左边矩阵的列数等于右边矩阵的行数，形如：$A_{M \times N} \cdot B_{N \times K} = C_{M \times K}$。矩阵相乘的结果是一个矩阵，行数和列数分别为左边矩阵的行数和右边矩阵的列数。其中的每个元素值为左边行于右边列中每个元素相乘再相加的结果。

$$
\begin{align*}
设 A_{3 \times 2} &= \begin{bmatrix} a_{11} & a_{12}  \\ a_{21} & a_{22} \\ a_{31} & a_{32} \end{bmatrix} 
, \quad
B_{2 \times 4} = \begin{bmatrix} b_{11} & b_{12} & b_{13} & b_{14} \\ b_{21} & b_{22} & b_{23} & b_{24} \end{bmatrix} \\[10pt]

C_{M \times K} &= A_{M \times N} \cdot B_{N \times K} \\
& = \begin{bmatrix} a_{11} & a_{12}  \\ a_{21} & a_{22} \\ a_{31} & a_{32} \end{bmatrix} \cdot \begin{bmatrix} b_{11} & b_{12} & b_{13} & b_{14} \\ b_{21} & b_{22} & b_{23} & b_{24} \end{bmatrix} \\
& = 
\end{align*}
$$


### 矩阵的秩和奇异值分解

### 自然对数In(x)


## LoRA方法原理

### ?

## 模型参数训练原理(todo)

### softmax

### 损失函数loss和交叉熵

### 反向传播和梯度

### 训练流程总结

## 训练数据准备

## 使用LoRA微调

## 参考
- 【AI】一文读懂大模型生态：分类/参数/结构/训练/GPU/评测/排行/社区\
  https://jzplp.github.io/2026/llm-stru.html
- 【AI】大模型本地部署与量化：Ollama、transformers、llama.cpp实践\
  https://jzplp.github.io/2026/llm-deploy.html
- LaTeXLive在线公式编辑器\
  https://www.latexlive.com/
