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

C_{3 \times 4} &= A_{3 \times 2} \cdot B_{2 \times 4} \\
& = \begin{bmatrix} a_{11} & a_{12}  \\ a_{21} & a_{22} \\ a_{31} & a_{32} \end{bmatrix} \cdot \begin{bmatrix} b_{11} & b_{12} & b_{13} & b_{14} \\ b_{21} & b_{22} & b_{23} & b_{24} \end{bmatrix} \\
&= \begin{bmatrix}
a_{11}b_{11}+a_{12}b_{21} & a_{11}b_{12}+a_{12}b_{22} & a_{11}b_{13}+a_{12}b_{23} & a_{11}b_{14}+a_{12}b_{24}\\
a_{21}b_{11}+a_{22}b_{21} & a_{21}b_{12}+a_{22}b_{22} & a_{21}b_{13}+a_{22}b_{23} & a_{21}b_{14}+a_{22}b_{24}\\
a_{31}b_{11}+a_{32}b_{21} & a_{31}b_{12}+a_{32}b_{22} & a_{31}b_{13}+a_{32}b_{23} & a_{31}b_{14}+a_{32}b_{24}
\end{bmatrix}
\end{align*}
$$

因此，矩阵相乘不满足交换律，因为换之后中间的行列数可能不相等，即使相等，计算结果也不同；但满足结合律，即计算括号可以重新组合。

$$
\begin{align}
& 交换律： \\
& A_{M \times N} \cdot B_{N \times K} 合法 \quad B_{N \times K} \cdot A_{M \times N} 不合法 \\
& 结合律： \\
& (A_{M \times N} \cdot B_{N \times K}) \cdot C_{K \times J} = A_{M \times N} \cdot (B_{N \times K} \cdot C_{K \times J})
\end{align}
$$

向量可以看作是一个特殊的矩阵，即行或者列为1。下面列举几种矩阵相乘的特殊场景。首先是矩阵乘向量，结果为另一个向量：

$$
\begin{align*}
C_{3 \times 1} &= A_{3 \times 2} \cdot B_{2 \times 1} \\
&= \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \\ a_{31} & a_{32} \end{bmatrix} \cdot \begin{bmatrix} b_{11} \\ b_{21} \end{bmatrix} 
= \begin{bmatrix}
a_{11}b_{11}+a_{12}b_{21} \\
a_{21}b_{11}+a_{22}b_{21} \\
a_{31}b_{11}+a_{32}b_{21}
\end{bmatrix}
\end{align*}
$$

然后是向量乘向量，结果有两种，如果左边一行形式向量乘右边一列形式的向量，则结果为一个数字。如果反过来，则是一个矩阵。

$$
\begin{align*}
A_{1 \times 3} \cdot B_{3 \times 1}
&= \begin{bmatrix} a_{11} & a_{12} & a_{13} \end{bmatrix} \cdot \begin{bmatrix} b_{11} \\ b_{21} \\ b_{31}  \end{bmatrix} 
= a_{11}b_{11}+a_{12}b_{21}+a_{13}b_{31} \\
A_{3 \times 1} \cdot B_{1 \times 3}
&= \begin{bmatrix} a_{11} \\ a_{21} \\ a_{31} \end{bmatrix} \cdot \begin{bmatrix} b_{11} & b_{12} & b_{13}  \end{bmatrix} 
= \begin{bmatrix} a_{11}b_{11} & a_{11}b_{12} & a_{11}b_{13}  \\ a_{21}b_{11} & a_{21}b_{12} & a_{21}b_{13} \\ a_{31}b_{11} & a_{31}b_{12} & a_{31}b_{13} \end{bmatrix}
\end{align*}
$$

对角矩阵指的是当矩阵的元素中行坐标和列坐标相等时才有元素值，其余都为0。这里展示一下普通矩阵乘对角矩阵的效果，可以看到相当于给列元素增加了一个系数。

$$
\begin{align*}
C_{3 \times 2} &= A_{3 \times 2} \cdot B_{2 \times 2} \\
&= \begin{bmatrix} a_{11} & a_{12} \\ a_{21} & a_{22} \\ a_{31} & a_{32} \end{bmatrix} \cdot \begin{bmatrix} b_{11} & 0 \\  0 & b_{22} \end{bmatrix} 
= \begin{bmatrix}
a_{11}b_{11} & a_{12}b_{22} \\
a_{21}b_{11} & a_{22}b_{22} \\
a_{31}b_{11} & a_{32}b_{22}
\end{bmatrix}
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
