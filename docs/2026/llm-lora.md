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


### 矩阵的秩
首先介绍一下矩阵的初等变换。矩阵的初等变换有行变换和列变换，规则是一致的，这里以行变换说明。以下几种变换是初等行变换：

1. 交换任意两行的位置
2. 非0的常数乘任意一行
3. 把任意一行乘以非0常数，加到另一行上面

如果一个矩阵经过任意数量的初等变换之后，尽量将矩阵中的行（或者列）变为全0。剩下的无法变化的行数（或列数）就是矩阵的秩。如何可以变为全0？如果一行是其它行的倍数，或者可以被其它多个行经过倍数和加减表示，那么这一行就可以变为0。

例如下面的例子，第二行是第一行的两倍，那么第二行=第一行*2，第四行=第一行+第三行，那么第二行和第四行都可以经过初等行变换处理为全0行。

$$
\begin{bmatrix}
A_{1} \\ A_{2} \\ A_{3} \\ A_{4} \end{bmatrix}
= \begin{bmatrix}
1 & 2 & 3 & 4
\\ 2 & 4 & 6 & 8
\\ 1 & 0 & 1 & 0
\\ 2 & 2 & 4 & 4
\end{bmatrix} = \begin{bmatrix}
1 & 2 & 3 & 4
\\ 1*2 & 2*2 & 3*2 & 4*2
\\ 1 & 0 & 1 & 0
\\ 1+1 & 2+0 & 3+1 & 4+0
\end{bmatrix}
= \begin{bmatrix}
A_{1}
\\ A_{1}*2
\\ A_{3}
\\ A_{1} + A_{3}
\end{bmatrix}
$$

剩下无法被其它向量表示的向量，都是线性无关的，这些线性无关的向量个数即是矩阵的秩。从信息论的角度来说，这些可以被其它向量表示的向量，是不增加信息量的，它自身没有存在价值，属于冗余参数。

### 对数
首先看一下对数的概念。如果a的y次方为x，那么y就是以a为底的x的对数。其中a>0且a≠1。其中自然对数In(x)是以e为底的对数。e是一个无理数，值为e=2.71828...。

$$
\begin{align*}
a^{x}=b \quad  \Leftrightarrow \quad x &=\log_{a}{b} \\
e^{x}=b \quad  \Leftrightarrow \quad x &=\ln{b} \\
\end{align*}
$$

对数满足一些特殊的运算性质：

$$
\begin{align*}
\\
\log_{a}{M*N} &= \log_{a}{M} + \log_{a}{N} \\
\log_{a}{\frac{M}{N} } &= \log_{a}{M} - \log_{a}{N} \\
\log_{a}{M^{N}} &= N * \log_{a}{M}
\end{align*}
$$

对数相关的求导公式：

$$
\begin{align*}
{(\log_{a}{x})}' &= \frac{1}{x\ln{a}} \\
{(\ln{x})}' &= \frac{1}{x}
\end{align*}
$$

当a的范围在0到1之间时，与a>1时，对应$y=\log_{a}{x}$的函数图像不同，一个开口向下，一个开口向上。例如下图中，红线是1/2时函数的曲线，蓝线是底数为2的曲线。不管底数的值如何，它们都经过(1, 0)这个点。

​![](/2026/llm-lora-1.png)

特别的，$y=x-1$这个直线是$y=\ln{x}$这个函数在(1, 0)这个点的切点，且$\ln{x}\le x-1$永远成立，且相等的位置只有(1, 0)这个点。通过图像可以直观感受到：

​![](/2026/llm-lora-2.png)

但是对于其它底数，这个不等式却不一定成立。例如$y=\log_{2}{x}$在(1, 0)这个点的切点斜率（也就是导数）是$\frac{1}{x\ln{2}}$，和$y=x-1$的斜率不同，因此这条直线并不是切线，函数值也不一定都在这条直线下方，如图所示，x在1到2的区间内，函数值在直线上方。

​![](/2026/llm-lora-3.png)

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
- 图解大模型微调系列之：大模型低秩适配器LoRA（原理篇）\
  https://zhuanlan.zhihu.com/p/646831196
- LoRA这种微调方法和全参数比起来有什么劣势吗？\
  https://www.zhihu.com/question/608674675
- 数学图形工具组\
  https://www.desmos.com/?lang=zh-CN
