# 【AI】大模型LoRA微调和参数训练的原理分析（未完成）
todo 简单介绍
本来想一篇文章介绍 LoRA微调和参数训练的原理，在加上实验验证。但是没想到原理的介绍越来越长，因此还是分开文章说吧。

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

再简单提一下指数的运算性质：

$$
\begin{align*}
a^m \cdot a^n = a^{m+n} \\
\frac{a^m}{a^n} = a^{m-n} \\
(a^m)^n = a^{m\cdot n} \\
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

​![](/2026/lora-theory-1.png)

特别的，$y=x-1$这个直线是$y=\ln{x}$这个函数在(1, 0)这个点的切点，且$\ln{x}\le x-1$永远成立，且相等的位置只有(1, 0)这个点。通过图像可以直观感受到：

​![](/2026/lora-theory-2.png)

但是对于其它底数，这个不等式却不一定成立。例如$y=\log_{2}{x}$在(1, 0)这个点的切点斜率（也就是导数）是$\frac{1}{x\ln{2}}$，和$y=x-1$的斜率不同，因此这条直线并不是切线，函数值也不一定都在这条直线下方，如图所示，x在1到2的区间内，函数值在直线上方。

​![](/2026/lora-theory-3.png)

### 偏导数
首先来复习一下导数的概念。函数的导数也是一个函数，指的是函数在某一点的变化率，也可以被称作斜率。用极限公式表示如下：

$$
\begin{align*}
&设\bigtriangleup x 为变量x在某一点的变化 \\
&y = f(x)的导数函数为： \\
&\frac{\mathrm{d} y}{\mathrm{d} x} = {f}'(x) = \lim_{\bigtriangleup x \to 0} \frac{f(x+\bigtriangleup x) - f(x)}{\bigtriangleup x} 
\end{align*}
$$

当一个函数的变量有多个时，如果想求这个函数对其中一个变量的导数，那这就是偏导数。

$$
\begin{align*}
&设函数 z = f(x, y)\\
&函数对于x的偏导数表示为：\frac{\partial z}{\partial x} = \frac{\partial (f(x, y))}{\partial x} \\
&函数对于y的偏导数表示为：\frac{\partial z}{\partial y} = \frac{\partial (f(x, y))}{\partial y} \\ 
\end{align*}
$$

如何求偏导数的值呢？实际上和普通的求导方式一致，即把当前求导的变量看做变量，而把其它变量看作常数即可。这里举个简单的例子：

$$
\begin{align*}
&设函数 z = x^2 + y^2 + xy\\
&\frac{\partial z}{\partial x} = 2x + y \quad (相当于 \frac{\mathrm{d} z}{\mathrm{d} x}) \\
&\frac{\partial z}{\partial y} = 2y + x \quad (相当于 \frac{\mathrm{d} z}{\mathrm{d} y}) \\
\end{align*}
$$

从几何意义上来说，假设z=f(x,y)是一个三位曲面，则对x求偏导相当于曲面沿x轴方向的变化率，对y求偏导相当于曲面沿y轴方向的变化率。还有一些其它下面可能涉及到的求导公式：

$$
\begin{align*}
\\
(\frac{1}{u})' = -\frac{1}{u^2} \\
(uv)' = u'v + uv' \\
(\frac{u}{v})' = \frac{u'v - uv'}{v^2} \\
\end{align*}
$$

然后再说一下求导的链式法则，即复合函数的导数等于内层函数导数乘外层函数导数。这个法则对于导数和偏导数都适用：

$$
\begin{align*}
& 设z = g(y) \quad y = f(x)  \quad 则 z = g(f(x)) \\ 
& 链式法则：\frac{\mathrm{d} z}{\mathrm{d} x} = \frac{\mathrm{d} z}{\mathrm{d} y} \cdot \frac{\mathrm{d} y}{\mathrm{d} x} \\
& 设z = g(x, y) \quad y = f(a)  \quad 则 z = g(x, f(a)) \\
& 链式法则：\frac{\partial z}{\partial a} = \frac{\partial z}{\partial y} \cdot \frac{\partial y}{\partial a}
\end{align*}
$$

这个法则在平时计算导数时也是经常使用的，我们看个求导的简单例子：

$$
\begin{align*}
设：& z = ln(x^2)，求\frac{\mathrm{d} z}{\mathrm{d} x} \\
解：& \\
& 令y = x^2 \quad 则 z = ln(x^2) \Rightarrow \begin{cases}
z = g(y) = \ln(y) \\
y = f(x) = x^2
\end{cases} \\
& \frac{\mathrm{d} z}{\mathrm{d} x} = \frac{\mathrm{d} z}{\mathrm{d} y} \cdot \frac{\mathrm{d} y}{\mathrm{d} x}
= \frac{1}{y}\cdot 2x = \frac{2x}{x^2}  = \frac{2}{x} 
\end{align*}
$$

但注意如果是多个子函数中都出现同一个求导的自变量a，那么链式法则就要变化一下了，需要每个涉及到自变量的都进行链式求导，再相加。

$$
\begin{align*}
& 设z = f_1(x, y) \quad y = f_2(a) \quad x = f_3(a)  \quad 则 z = f_1(f_3(a), f_2(a)) \\
& 链式法则：\frac{\partial z}{\partial a} = \frac{\partial z}{\partial y} \cdot \frac{\partial y}{\partial a}
+ \frac{\partial z}{\partial x} \cdot \frac{\partial x}{\partial a}
\end{align*}
$$

## LoRA方法原理

### LoRA简介
众所周知，大模型之所以有“大”这个字，是因为模型参数量非常大，训练和部署都需要较高的算力和内存（显存）。尤其是训练对于硬件的要求更高，在之前的文章中我们也描过：[【AI】一文读懂大模型生态：分类/参数/结构/训练/GPU/评测/排行/社区](https://jzplp.github.io/2026/llm-stru.html)。当我们想微调模型使其更好的适应某些任务或者知识时，如果将所有的参数一起调整，那么如此高的硬件要求会使得大部分开发者望而却步，无法实现。深度神经网络中的参数近似一个黑盒，我们无法区分出哪些参数对应哪些知识，精确的对某一部分参数做针对性调整。

那么有没有一种方法可以对大模型进行微调，但是不要求如此高的硬件性能，且不用精确挑选参数呢？有的，这就是LoRA方法。LoRA英文全称叫做Low-Rank Adaptation，即“低秩适应”方法，是由微软在2021年提出的，论文原文：[LoRA: Low-Rank Adaptation of Large Language Models(https://arxiv.org/abs/2106.09685)。

在大模型的每层中，有Q/K/V/O几个矩阵，这些矩阵的行数和列数都和向量维度有关，例如在Qwen3-0.6B中是1024‌×1024和1024‌×2048，每个矩阵的参数量都非常大。实际使用LoRA方法时，可以对这些矩阵全部微调，或者只选择部分微调。我们来看一下公式，这里以1024‌×1024为例说明。

$$
\begin{align*}
\\
设:& W_{1024 \times 1024}为 原始矩阵 \\
&X_{1024}为输入向量 \\
&H_{1024}为输出向量 \\
模型本身执行&: H_{1024} = W_{1024 \times 1024}X_{1024} \\
\end{align*}
$$

如果对所有参数都进行调整，这叫做“全量微调”，相当于在W旁边挂一个和W一样参数量的矩阵，它对于硬件的要求非常高。

$$
\begin{align*}
\\
设:& V_{1024 \times 1024}为全量微调的参数 \\
全量微调执行: H_{1024} &= W_{1024 \times 1024}X_{1024} + V_{1024 \times 1024}X_{1024}  \\
&= (W_{1024 \times 1024} + V_{1024 \times 1024})X_{1024} \\
\end{align*}
$$

但LoRA方法，将些矩阵冻结不修改，而是在旁边挂A和B两个小矩阵，通过调整两个小矩阵的参数值来影响最终结果。

$$
\begin{align*}
&设: A_{r \times 1024} 和 B_{1024 \times r} 为LoRA微调的参数 \\
LoRA微调执行: H_{1024} &= W_{1024 \times 1024}X_{1024} + (\frac{a}{r} )B_{1024 \times r}A_{r \times 1024}X_{1024}  \\
&= (W_{1024 \times 1024} +(\frac{a}{r} )B_{1024 \times r}A_{r \times 1024})X_{1024} \\
&= (W_{1024 \times 1024} +\bigtriangleup W_{1024 \times 1024})X_{1024} \\
\end{align*}
$$

其中a和r为超参数。超参数的含义是我们在训练之前就提前确定好的参数，训练过程中不会变化。虽然训练中不会变化，但参数值对于模型表现还是有较大影响的，甚至有时需要尝试针对不同的超参数进行训练。

r表示AB两个矩阵的行数和列数，一般可以取8，16，64等值。这里我们以8来举例。对于一个矩阵，全量微调需要调整的参数量为1024×1024=1048576。而LoRA方法仅需调整AB两个矩阵，参数量为2×1024×8=16384。16384/1048576=0.015%，也就是说通过LoRA使用r=8的参数，调整的参数量为全量微调的0.015%。

同时矩阵乘法的性质，$B_{1024 \times r}A_{r \times 1024}=\bigtriangleup W_{1024 \times 1024}$，AB两个矩阵无论r值取多少，相乘之后的矩阵形状都和模型原有的参数矩阵W一致，因此虽然LoRA方法参数量小，但它可以影响到模型原矩阵的每一个参数值。且当我们训练完成，希望将LoRA方法的调整混合回原模型时，也是简单的相加即可：

$$
\begin{align*}
W_{1024 \times 1024}^{'} &= W_{1024 \times 1024} + B_{1024 \times r}A_{r \times 1024} \\
&= W_{1024 \times 1024} + \bigtriangleup W_{1024 \times 1024} \\
\\
H_{1024} &= (W_{1024 \times 1024} +\bigtriangleup W_{1024 \times 1024})X_{1024} \\
&= W_{1024 \times 1024}^{'}X_{1024} 
\end{align*}
$$

a表示缩放比例。这个超参数如果固定不变，当r增大时，可以抵消由于矩阵维度增加带来数字增加，使得调节幅度突然增大的问题。但也有很多人与r搭配使用，使得a/r之后的数字相同，代表BA矩阵在不同的r下采用相同的缩放系数。

在实际应用中，BA矩阵可以合并进模型中，永久修改参数值，也可以保留外挂形式，甚至可以针对不同的任务微调不同的参数，使用时再切换不同的外挂矩阵。

### 简化计算
合并进原模型矩阵时需要计算BA相乘，组成1024×1024的矩阵。但在LoRA训练时，却不需要这么处理，而是走一条计算量更少的路，这里我们对比两种计算方式。其中每个操作计算方式为结果矩阵元素个数*单个元素的计算量。第一种是计算BA相乘的方式：

$$
\begin{align*}
&\bigtriangleup W_{1024 \times 1024} = B_{1024 \times 8}A_{8 \times 1024} \\
&乘法: 1024*1024*8 = 8388608 \\
&加法: 1024*1024*7 = 7340032 \\
\\
&W_{1024 \times 1024}^{'} = W_{1024 \times 1024} + \bigtriangleup W_{1024 \times 1024} \\
&加法: 1024*1024 = 1048576 \\
\\
&H_{1024} = W_{1024 \times 1024}^{'}X_{1024} \\
&乘法: 1024*1024 = 1048576 \\
&加法: 1024*1023 = 1047552 \\
\\
&合计 \quad 乘法: 9437184  \quad 加法: 9436160
\end{align*}
$$

可以看到，第一种方式计算量最大的就是BA相乘。第二种是先另A与X相乘，这样会得到一个8维的向量，再用这个向量与B相乘，这种方式可以大幅缩减原有BA相乘的计算消耗：

$$
\begin{align*}
&C_{8} = A_{8 \times 1024}X_{1024} \\
&乘法: 8*1024 = 8192 \\
&加法: 8*1023 = 8184 \\
\\
&H_{1024}^{''} = B_{1024 \times 8}C_{8} \\
&乘法: 1024*8 = 8192 \\
&加法: 1024*7 = 7168 \\
\\
&H_{1024}^{'} = W_{1024 \times 1024}X_{1024} \\
&乘法: 1024*1024 = 1048576 \\
&加法: 1024*1023 = 1047552 \\
\\
&H_{1024} = H_{1024}^{'} + H_{1024}^{''} \\
&加法: 1024 \\
\\
&合计 \quad 乘法: 1064960 \quad 加法: 1063928
\end{align*}
$$

通过计算结果可以看到，不管是乘法还是加法都明显大幅下降，这里我们再给出下降的比例，这里以乘法为例：

* 9437184/1064960 = 8.86  第一种的计算量是第二种的接近9倍
* 不使用LoRA方法的场景：只有WX这一个矩阵乘法计算，计算量为1048576
* 9437184/1048576 = 9 以第一种方式使用LoRA，计算量为不使用的9倍
* 1064960/1048576 = 1.0156 以第二种方式使用LoRA，计算量仅增加了1.56%

仅通过改变计算的先后顺序，能做到计算量相比不使用LoRA仅有微小的上涨，实际使用时可以几乎忽略不计。

### 低秩证明
前面说到LoRA的中文名叫做“低秩适应”，这里的秩表示的就是矩阵的秩，低秩意思是它用一个秩较低的矩阵取适应这个大的W矩阵，这里秩的值就是超参数r。

前面说过r值是矩阵A和B的列数和行数，那么A和B的矩阵的秩是小于等于r的。那么BA相乘的组合矩阵，虽然维度是1024×1024，但是秩依然是小于等于r的。事实上它不超过A的秩，也不超过B的秩。这里我们证明一下这个结论：

$$
\begin{align*}
& B_{1024 \times r}A_{r \times 1024} \\
&= \begin{bmatrix}
 b_{11}a_{11} + b_{12}a_{21} + ... & b_{11}a_{12} + b_{12}a_{22} + ... & b_{11}a_{13} + b_{12}a_{23} + ... & ...\\
 b_{21}a_{11} + b_{22}a_{21} + ... & b_{21}a_{12} + b_{22}a_{22} + ... & b_{21}a_{13} + b_{22}a_{23} + ... & ...\\
 b_{31}a_{11} + b_{32}a_{21} + ... & b_{31}a_{12} + b_{32}a_{22} + ... & b_{31}a_{13} + b_{32}a_{23} + ... & ...\\
 ... & ... & ... & ...
\end{bmatrix} \\
&= \begin{bmatrix}
b_{11}\begin{bmatrix} a_{11} \\ a_{12} \\ a_{13} \\ ... \end{bmatrix} +
b_{12}\begin{bmatrix} a_{21} \\ a_{22} \\ a_{23} \\ ... \end{bmatrix} + ... \\
b_{21}\begin{bmatrix} a_{11} \\ a_{12} \\ a_{13} \\ ... \end{bmatrix} +
b_{22}\begin{bmatrix} a_{21} \\ a_{22} \\ a_{23} \\ ... \end{bmatrix} + ... \\
b_{31}\begin{bmatrix} a_{11} \\ a_{12} \\ a_{13} \\ ... \end{bmatrix} +
b_{32}\begin{bmatrix} a_{21} \\ a_{22} \\ a_{23} \\ ... \end{bmatrix} + ... \\
...
\end{bmatrix} \\
\end{align*}
$$

可以看到，通过将矩阵乘法后的每一行拆分，可以将b看作系数，结果矩阵中的每一行都是由不同的B的系数乘以A矩阵中的每一行组成的（公式中为了方便说明以列向量表示，实际都是A的行向量）。通过这种方式，结果矩阵的每一行都是A矩阵的组合，根据矩阵的秩的定义，那么结果矩阵的秩肯定小于等于矩阵A的秩。

同理，我们查看结果矩阵的每一列，发现可以表示A矩阵作为系数，B的列向量作为结果矩阵每一列的组成部分。这里公式未列出，可以自行推导。因此结果矩阵的秩肯定小于等于矩阵B的秩。这里就证明了前面的结论：BA相乘的结果矩阵的秩，不超过A的秩，也不超过B的秩。

我们一般把r叫做LoRA训练后矩阵的秩。理论上训练结果的秩最大是r，小于r也是可能的。在实际的模型训练中，由于r的取值一般比较小，实际上都能让AB矩阵的秩达到r的状态。

使用LoRA来修改模型参数，好处是模型参数量小使得存储空间占用小，且训练容易。但低秩特性也有一些劣势，与全量微调的效果是有差距的。例如可以用LoRA做到调整输出风格，适配简单任务，但在学习有些新知识方面却较难做到。

### 初始化和均匀分布
在训练之前，首先将AB两个矩阵初始化。其中A矩阵的每个元素初始化为随机数，B矩阵初始化为全0矩阵。这样在开始训练时得到的结果与原模型一致。

$$
\begin{align*}
原模型： H_{1024} &= W_{1024 \times 1024}X_{1024} \\
LoRA初始化时：H_{1024} &= W_{1024 \times 1024}X_{1024} + B_{1024 \times r}A_{r \times 1024}X_{1024} \\
&= W_{1024 \times 1024}X_{1024} + \begin{bmatrix}
 0 & 0 & ... \\
 0 & 0 & ...\\
 ... & ... & ...
\end{bmatrix}A_{r \times 1024}X_{1024} \\
&= W_{1024 \times 1024}X_{1024}
\end{align*}
$$

在这个初始化基础上，每次输入训练数据得到输出token，再根据输出token是否正确来反向更新AB矩阵的每个参数，每次只更新一个很小的值。最后训练完毕后得到AB矩阵最终的参数值。

那么应该如何A矩阵的初始化方式呢？理论上任意的随机数都可以，因为模型训练时会逐步调整参数值。但部分不合理的初始化方式会使得模型初始化时偏差较大，致使参数调整过程更长也更难。因此，合理的初始化方式可以让训练过程更轻松，更容易达到想要的结果。

微软在当年提出的论文中，使用的是高斯分布来生成随机数。但目前最常用的是采用Kaiming Uniform分布（均匀分布）来实现，这也是各大框架的默认方式。这是由中国人何恺明发明的，他还发明了深度残差网络（ResNet），现在几乎所有大模型都在使用。

首先介绍下均匀分布。均分分布指的是设定一个范围，在这个范围内生成随机数，且随机数的在这个范围内每个位置出现的可能性都是一样的。例如范围为(0,10)，则随机数在(0,5)之间的概率和(5,10)一致，都是50%；且和(3,8)的概率也一致。

然后再介绍一下Kaiming Uniform分布，这个分布是为了ReLU激活函数设计的权重初始化方法‌。它的均匀分布中点为0，分布的范围是这样：(-bound, bound)。其中bound的计算公式如下：

$$
bound = \sqrt{\frac{6}{(1+a^2)fan\_in}}
$$

其中a与RELU有关，fan_in指的是输入维度的的个数。但本文的LoRA与激活函数是两回事，因此这里就不介绍公式和ReLU了。在PyTorch中为了和之前的分布公式做兼容，LoRA中的a值默认取$\sqrt{5}$，计算结果如下：

$$
\begin{align*}
bound &= \sqrt{\frac{6}{(1+a^2)fan\_in}} \\
&= \sqrt{\frac{6}{(1+\sqrt{5}^2)fan\_in}} \quad (带入a=\sqrt{5}) \\
&= \sqrt{\frac{6}{6fan\_in}} \\
&= \frac{1}{\sqrt{fan\_in}}
\end{align*}
$$

这就是LoRA中A矩阵初始化随机数的分布范围计算公式。带入fan_in的值为1024，最后计算出bound的结果为1/32 = 0.03125。因此均匀分布的范围就是 (-0.03125,0.03125)。

## Softmax归一化函数
前面我们介绍了LoRA方法的技术原理，也提到了如何对LoRA进行初始化，但是没有描述如何训练，怎么对这些参数进行更新。事实上，对LoRA中的AB矩阵进行训练的方式，与在原模型中训练方式的方式是一致的。都是先输入一段文本，转换成token列表，正向计算一遍输出预测下一个token的概率。然后与正确结果比较，通过反向传播更新参数值。只不过更新的参数值不一样。为了更好的理解参数训练流程，介绍一下从输出结果开始的部分参数训练的原理。首先介绍的是Softmax归一化函数。

通过大模型神经网络一层一层计算，最后得到的输出是一个向量，长度为词表长度，其中每个值为词表中每个token的对应值。这个值越大，表示预测为这个token的概率越高。但这个值可能是正数，也可能是负数，甚至可能向量中每个值都是负数。此时肯定不能将所有值简单相加算概率，否则就会出现负的概率值，而且可能某些token的概率超过1。这里举个几个例子：

$$
\begin{align*}
&设p_i为第i个元素的概率  \\
\\
例子1：&A = [3, -1, 3]  \\
&p_2 = \frac{-1}{3-1+3} = -\frac{1}{5} \\
\\
例子2：&A = [-3, 1, 3] \\
&p_3 = \frac{3}{-3+1+3} = 3   
\end{align*}
$$

这明显是不可行的。因此需要一个归一化函数，将这些值对应位每个token对应的概率值，同时保证不会出现负值，且所有概率值相加为1。Softmax就是一个指数归一化函数。这里列举函数的计算公式：

$$
\begin{align*}
&设 A = [a_1, a_2, ..., a_n]为模型输出向量; \\
&n为向量长度，p_i为第i个token的概率值 \\
\\
&p_i = softmax(a_i) = \frac{e^{a_i}}{\sum_{j=1}^{n}e^{a_j}}  \\
\end{align*}
$$

可以看到，公式其实比较简单，就是将前面我们直接将输出值相加，改成了先计算指数再加和计算概率。因为不管原值如何，经过指数运算之后都变成了正值，因此保证了所有概率值相加为1，且不会出现负值。Softmax仅仅是比较值之间的差，根据差值计算概率。对于值中的“相同部分”并不会影响概率值。这里举几个例子：

$$
\begin{align*}
例子1：&A = [1, 2, 3]  \\
&p_i = \frac{e^{i}}{e^{1} + e^{2} + e^{3}} \\
\\
例子2：&A = [101, 102, 103] \\
&p_i = \frac{e^{100+i}}{e^{101} + e^{102} + e^{103}} \\
&= \frac{e^{100} \cdot e^i}{e^{100} \cdot e^{1} + e^{100} \cdot e^{2} + e^{100} \cdot e^{3}} \\
&= \frac{e^i}{e^{1} + e^{2} + e^{3}} \\
\end{align*}
$$

通过上面的例子可以看到，虽然第一个例子是1，2，3；第二个例子是101，102，103；但我们利用指数运算性质，拆分出例子2中每个值的相同部分，然后被分子分母约掉，就只剩下每个数之间相差的部分了。因此Softmax做到了仅根据值之间的差来计算概率。

注意这是训练时计算概率值的方式。推理时也使用Softmax计算概率，但输出会多一些处理。这里是描述训练过程，因此不介绍推理的相关步骤。

## 损失函数和交叉熵
### 损失函数概念
前面我们通过Softmax函数，拿到大模型预测每个Token的概率值。在训练时，我们使用的是带答案的训练集数据，因此会有一个正确的输出token值。但只拿到这些还不够，大模型需要一个值来表示模型距离预测正确还有多远，即把大模型输出值和训练集“正确值”比较，看看模型预测的是正确还是错误，错误的量是多少。这样可以对模型当前预测结果给一个定量的评价，再根据这个评价调整参数值。这就是损失函数需要做的事情。

有人会说，这太简单了。如果模型预测token和训练集的正确token一致，那说明模型预测正确，如果不一致，就是模型预测错误。但这样只解决了正确性问题，没有定量的结果。试想模型输出的token值是一个概率，这个概率的大小不同，对于模型的评价应该是不一样的：

$$
\begin{align*}
\\
&设P为模型输出的概率向量，p_i为模型输出第i个token的概率 \\
&例子1：P = [0.01, ... 0.01, p_a = 0.02, 0.01, ... 0.01] \\
&且a为正确token，即预测正确 \\
&例子2：P = [0.01, ... 0.01, p_a = 0.8, 0.01, ... 0.01] \\
&且a为正确token，即预测正确 \\
&例子3：P = [0.01, ... 0.01, p_a = 0.02, 0.01, ... 0.01] \\
&且a为不正确token，即预测错误 \\
&例子4：P = [0.01, ... 0.01, p_a = 0.8, 0.01, ... 0.01] \\
&且a为不正确token，即预测错误 \\
\end{align*}
$$

例子1和例子2都预测正确了，但是概率值相差巨大，对于模型的评价应该是一样的么？例子1和例子2都预测正确了，但错误的概率值相差巨大，对于模型的评价应该是一样的么？希望回答这些问题，就要找一个合适的损失函数来评价大模型场景的输出。

大模型场景实际上是一种One-hot分类场景，即输出值是一个向量，向量中的每个数字是这个分类的概率，但是只有一个分类是正确的。适用于One-hot分类场景的损失函数就是交叉熵。如果是多分类场景，例如给图像打标签，但是允许一个图像有多个标签，这时候就不能用交叉熵，需要采用其他损失函数。

损失函数的英文名叫做loss function，其中的损失就是loss。损失函数的入参为模型的输出值和训练集给出的结果，出参为得到的损失值，即模型离“完全正确”有多远。因此损失函数的输出一般为非负数，0值表示完全正确，值越大说明损失越大，即离正确越远。

### 信息量
想要了解交叉熵，需要先了解信息量和熵的概念。信息量指的是一个事件发生时，提供给我们的信息有多少，或者说事件发生时我们的惊讶程度。例如一个概率为99%的事件发生时，信息量比较小，因为它几乎时必然发生的。但是当概率为1%的事件发生时，我们会非常惊讶，因为基本不可能发生的事情发生了。因此，信息量有如下的特点：

1. 事件发生的概率越小，当这个事件真正发生时，信息量就越大。
2. 概率为100%的事件发生时，信息量为0，概率为0的事件发生时，信息量为无穷大。
3. 信息量为非负数。
4. 如果两个事件独立，则两个事件同时发生时的信息量等于两个事件单独发生时的信息量相加。

因此，在满足这些条件的基础上，将信息量的公式定义如下：

$$
\begin{align*}
&设P(x)为x事件发生的概率，I(x)为x事件发生的信息量 \\
&I(x) = log(\frac{1}{P(x)}) = -log(P(x))
\end{align*}
$$

​![](/2026/lora-theory-4.png)

通过对应的公式曲线图，可以看到当处于横坐标（也就是概率值）处于0-1的范围内时，函数值从无穷开始逐渐下降，一直到0。这里再明确计算下上面说的性质：

$$
\begin{align*}
&-log(0) = +\infty \\
&-log(1) = 0 \\
&I(a) + I(b) = -log(P(a)) -log(P(b)) = -log(P(a)*P(b)) \\
&= -log(P(ab)) = I(ab)
\end{align*}
$$

前面的公式中我们只用了log，没有提到底数值，事实上不同场景使用的底数不同。当希望计算信息量对应的二进制位时，以2为底数计算；而在深度学习大模型中，为了计算方便使用e为底数。这里举例下以2为底时，直接求得的信息量值，就是需要的二进制位表示。

$$
\begin{align*}
-log_2(0.5) = -log_2(\frac{1}{2}) = log_2(2) = 1 \quad bit \\
-log_2(0.25) = -log_2(\frac{1}{4}) = log_2(4) = 2 \quad bit \\
-log_2(0.1) = -log_2(\frac{1}{10}) = log_2(10) \approx 3.32 \quad bit \\
\end{align*}
$$

这里的二进制位是什么意思呢，可以看作是这个概率所需要的平均编码位数的最低值。这里举几个例子：

* 四个事件，每个概率1/4。每个信息量为2。分别编码为 00 01 10 11 编码长度一致
* 四个事件，每个概率为1/2, 1/4, 1/8, 1/8。对应信息量为1，2，3，3。对应哈夫曼编码为：0 10 110 111。编码长度一致。
* 三个事件，每个概率1/3。每个信息量约为1.58。对应哈夫曼编码为：0 10 11。 平均编码长度5/3 ≈ 1.67 > 信息量。

可以看到，当概率是2的n次方时，使用哈夫曼编码的长度与信息量一致。但如果信息量计算结果非整数，那么哈夫曼编码的每个元素必须是整数值，因此可能达不到最小值。

### 信息熵
前面描述的信息量，表示的是单个事件发生时的信息多少或者惊讶程度。那么对于一个完整的分布（即多个互斥事件的组合，加起来概率为1）它的平均信息量则用信息熵来表示，它是信息量的期望，也就是整个分布的平均惊讶程度。计算公式如下：

$$
\begin{align*}
\\
&设X为整个分布，n为分布中事件个数 \\
&H(X) = \sum_{i=0}^{n} P(i)I(i) = -\sum_{i=0}^{n} P(i)log(P(i))  \\
\end{align*}
$$

可以看到，实际上就是每个事件发生的信息量乘事件发生的概率。以通常意义来讲，如果这个分布确定性较高，那么信息熵比较小，如果分布的更随机，那么信息熵就更大。当事件个数固定，每个事件的概率相等时，分布最随机，此时信息熵最大。这里举个以2为底的例子：

* 两个事件，每个概率1/2。信息熵为1.
* 两个事件，概率分别为1/4，3/4。信息熵为1/2 + 3/4*0.415 ≈ 0.81
* 三个事件，每个概率1/3。信息熵约为1.58。
* 三个事件，概率分别为1/8，1/8，3/4。信息熵为3/8 + 3/8 + 3/4*0.415 ≈ 1.06
* 三个事件，概率分为1，0，0 信息熵为0

这个现象背后的含义是，如果每个事件概率相等，则最终哪个事件发生是非常不确定的，难以预测的。但如果某个事件概率较高（对应其它事件概率较低），那么说明这个分布更容易发生这个事件，更容易预测，则信息熵更低。极端情况下，当某个事件概率为1，必然发生，则这个分布整体是没有不确定性的，此时信息熵为0。

### 交叉熵
前面描述的信息熵，表达了真实世界（或者说正确的）事件发生的概率分布所代表的平均信息量。对于模型来说，它不知道正确的概率分布是什么，它有一个自己的概率分布，通过学习来预测和逼近正确的概率分布，这就是大模型学习的意义。大模型预测的概率分布和正确的概率分布是有差别的，那么如果来描述这个差别呢，就要交叉熵。

$$
\begin{align*}
\\
&设P(x)为正确的概率分布，Q(x)为预测的概率分布 \\ 
&H(p,q)为交叉熵，n为事件个数 \\
&H(p,q) = \sum_{i=0}^{n} P(i)I(i) = -\sum_{i=0}^{n} P(i)log(Q(i)) \\
\end{align*}
$$

可以看到公式和信息熵非常相似，区别在于是以真实发生的概率乘模型预测概率的信息量，可以理解为真实事件发生时，我们心里想的是预测分布，以预测分布的角度对事件的平均惊讶程度。当我们预测的概率分布与真实分布完全一致时，交叉熵的格式就与信息熵完全一致了。

交叉熵减去信息熵的差值有个名称，叫做KL散度（Kullback-Leibler Divergence），用于表示两个分布之间的差异。KL散度的公式如下：

$$
\begin{align*}
D_{KL}(p,q) &= -\sum_{i=0}^{n} P(i)log(Q(i)) -(-\sum_{i=0}^{n} P(i)log(P(i))) \\
&= \sum_{i=0}^{n} P(i)(log(P(i)) - log(Q(i)))) \\
&= \sum_{i=0}^{n} P(i)log(\frac{P(i)}{Q(i)} )
\end{align*}
$$

为什么叫做“散度”？这个词的直观可以理解为“散开的程度”。其实它也想叫做“距离”，但是因为不完全满足距离的几个条件，因此被叫做散度。(下面的条件可以随便举个例子来证明不满足，这里证明就不列出了)

1. 对称性 不满足 H(p,q) ≠‌ H(q,p)
2. 非负性 满足
3. 相同对象距离为0 满足
4. 三角不等式，即三个对象两两连接，任意两条边距离的和大于第三条边的距离 不满足

交叉熵永远大于等于信息熵，且相等时表示预测分布与真实分布一致。也就是说KL散度的永远大于等于0，这也就是吉布斯不等式的定义。这里给出证明：

$$
\begin{align*}
&设交叉熵的公式以a为底 \\
&D_{KL}(p,q) = \sum_{i=0}^{n} P(i)log_a(\frac{P(i)}{Q(i)} ) \\
&= \sum_{i=0}^{n} P(i)\frac{ln(\frac{P(i)}{Q(i)})}{lna} = \frac{1}{lna} \sum_{i=0}^{n} P(i)ln(\frac{P(i)}{Q(i)}) \\
&= \frac{1}{lna} \sum_{i=0}^{n} P(i)ln(\frac{P(i)}{Q(i)}) = -\frac{1}{lna} \sum_{i=0}^{n} P(i)ln(\frac{Q(i)}{P(i)}) \\
&(由于lnx \le x - 1 且x = 1时等号成立 \quad 那么-lnx \ge x-1 ) \\
&\ge -\frac{1}{lna} \sum_{i=0}^{n} P(i)(\frac{Q(i)}{P(i)} - 1) = -\frac{1}{lna} \sum_{i=0}^{n} (Q(i) - P(i)) \\ 
&= -\frac{1}{lna}(\sum_{i=0}^{n} Q(i) - \sum_{i=0}^{n} P(i)) = -\frac{1}{lna}(1 - 1) = 0 \\
\\
&\therefore \quad D_{KL}(p,q) \ge 0 且当\frac{Q(i)}{P(i)} = 1时等号成立，即两个分布一致 \\
\end{align*}
$$

注意看，虽然前面对数的不等式只对自然对数成立，但我们利用换底公式把任意底数转换为了自然对数，同时提出一个公共常数。由于最后减号两侧互相抵消，因此常数部分被不起作用。

在深度学习中，经常使用交叉熵作为概率分类的损失函数使用，交叉熵的值越小，即KL散度越小，则模型越逼近正确的概率分布，即模型的效果越好（当然也可能是过拟合了）。但是在大模型这种One-hot分类场景中，正确分布只有一个值，概率为1，因此交叉熵会在上述公式的基础上简化为非常简单的形式：

$$
\begin{align*}
&设x为正确分布中发生的事件 \\ 
&H(p,q) = -\sum_{i=0}^{n} P(i)ln(Q(i)) \\
&= -0\cdot ln(Q(1)) -0\cdot ln(Q(2)) ... -1\cdot ln(Q(x)) ... -0\cdot ln(Q(n)) \\
&= -ln(Q(x))
\end{align*}
$$

## 反向传播和梯度
### 概念说明
大模型接收token列表，通过多层深度神经网络处理，最后输出一个词表长度的向量，这个向量的名字叫做logits。然后再使用前面介绍的Softmax归一化为概率向量，再通过交叉熵损失函数最后求得loss值。这个完整的过程叫做前向传播，除了计算loss之外，和推理过程是基本一致的。loss值可以评价模型离“正确输出”有多远，使用loss值作为基础，从后到前反向通过每一层神经网络，指导每个参数应该如何更新，即修改参数值。这就是反向传播的过程。

要知道大模型参数值非常巨大，如何根据loss值计算出每个参数应该更新多少呢？这就要通过梯度的方式。梯度实际上是每个参数对于loss的偏导数，即每个参数对于loss值的变化率。

试想我们计算loss的目的是通过loss来修改参数值，最终使得loss值变小。训练时需要经过大量数据，每个数据都会产生一个loss值，都会去更新每个参数值；那么每个数据对于参数值的影响，即每次修改的参数值范围是很小的。这里就和偏导数的直观含义类似：即参数有一个微小变化时，会对loss值产生一个微小的影响，这个微小影响就是参数在这个值的变化率，即偏导数。

因此，梯度就是偏导数。反向传播的概念就是通过loss值，一步一步从后向前计算出每个参数的偏导数。最后再将梯度输入优化器，通过优化器给参数一个微小改动，从而使得模型拥有学习和调整能力。注意优化器和修改参数值本身并不属于反向传播的过程。

我们可以把神经网络看作是一个超大的函数。前向传播时，函数的变量是token向量，网络中的参数值是常量。但反向传播时，我们把神经网络入参看作是不变的常量，将网络中的参数值看作是变量，通过这种方式来求偏导数。

### logits梯度
前面介绍过，神经网络的输出在经过Softmax归一化之前的向量，叫做logits。梯度的计算的起点就是logits，这里首先要计算logits中的每一个值对于的loss的偏导数。将交叉熵损失函数和Softmax合并起来一起计算偏导，会更简单，因此先尝试合并计算的方式。首先是列出两个函数合并后的公式表示：

$$
\begin{align*}
\\
设：&L为loss值；x为正确token对应的词表序号；\\
& H为交叉熵函数；P为模型预测概率向量，每个元素为p_i；\\
& S为Softmax函数；A为logits向量，每个元素为a_i；\\
L =& H(S(A)) = -ln(S(a_x)) = -ln(\frac{e^{a_x}}{\sum_{j=1}^{n}e^{a_j}} ) \\
=& ln(\frac{\sum_{j=1}^{n}e^{a_j}}{e^{a_x}} ) = ln(\sum_{j=1}^{n}e^{a_j}) - ln(e^{a_x}) \\
=& ln(\sum_{j=1}^{n}e^{a_j}) - a_x
\end{align*}
$$

可以看到，这个公式和正确token对应的词表序号有关，因此求偏导时要分为两种场景，这里分别给出证明：

$$
\begin{align*}
&当i \ne x时：\\
&\frac{\partial L}{\partial a_i} = \frac{e^{a_i}}{\sum_{j=1}^{n}e^{a_j}} = p_i
\\
&当i = x时：\\
&\frac{\partial L}{\partial a_x} = \frac{e^{a_x}}{\sum_{j=1}^{n}e^{a_j}} - 1 = p_x - 1
\\
&公式可以合并表示为：\\
&\frac{\partial L}{\partial a_i} = p_i - y_i \quad (当i = x时，y_i = 1；否则y_i= 0)
\end{align*}
$$

可以看到，经过合并和化简，使用很简单的方式就可以求出偏导数，结果也非常简洁。这就是logits向量中每个元素对于损失的梯度。

### 分开证明
前面介绍了合并计算的方式，但实际上单独对于交叉熵和Softmax求偏导计算梯度，也是可行的，就是麻烦一点（事实上也不是很麻烦，一开始我打算试一下看能求么，没想到直接就做出来了）。这里我们尝试将两个函数分开求偏导。首先求归一化后的向量对于loss的偏导数是非常简单的：

$$
\begin{align*}
\\
&设Q=[q_1, ...q_n]为归一化后的输出向量\\
&L为loss值；x为正确token。\\
&\frac{\partial L}{\partial q_i} = \frac{\partial (-ln(q_x))}{\partial q_i}\\
&= \begin{cases} -\frac{1}{q_x}  &当i=x \\ 0 &当i\ne x \end{cases} \\
\\
\end{align*}
$$

根据链式求导法则，如果想算loss对于logits的偏导数，可以分别求loss对于归一化向量的偏导数，乘以归一化向量对于logits的偏导数。第一个我们前面已经算出来了，第二个就是Softmax函数。

$$
\begin{align*}
&设：Q=[q_1, ...q_n]为归一化后的输出向量\\
&A=[a_1, ...a_n]为logits向量\\
&\frac{\partial q_i}{\partial a_i} = \frac{\partial (\frac{e^{a_i}}{\sum_{j=1}^{n}e^{a_j}})}{\partial a_i}\\
&=\frac{
\frac{\partial (e^{a_i})}{\partial a_i} \cdot \sum_{j=1}^{n}e^{a_j}
- e^{a_i} \cdot \frac{\partial (\sum_{j=1}^{n}e^{a_j})}{\partial a_i}
}{ (\sum_{j=1}^{n}e^{a_j})^2 } \\
&= \frac{
e^{a_i} \cdot \sum_{j=1}^{n}e^{a_j}
- e^{a_i} \cdot ^{a_i}
}{ (\sum_{j=1}^{n}e^{a_j})^2 } 
= \frac{
e^{a_i} ( \sum_{j=1}^{n}e^{a_j} - e^{a_i})
}{ (\sum_{j=1}^{n}e^{a_j})^2 } \\
&按照Softmax函数公式 q_i = softmax(a_i) = \frac{e^{a_i}}{\sum_{j=1}^{n}e^{a_j}} \\
&且q_1 + ... + q_n = 1\\
&原式 = q_i\frac{\sum_{j=1}^{n}e^{a_j} - e^{a_i}}{\sum_{j=1}^{n}e^{a_j}} \\
&= q_i(1 - q_i)
\end{align*}
$$

再根据链式法则合起来计算Loss对于logits的偏导数。注意首先纠正一个错误的求法：

$$
\begin{align*}
\\
&错误 \quad \frac{\partial L}{\partial a_i} = \frac{\partial L}{\partial q_i} \cdot  \frac{\partial q_i}{\partial a_i}\\
&正确 \quad \frac{\partial L}{\partial a_i} = \sum_{k=1}^{n} \frac{\partial L}{\partial q_k} \cdot  \frac{\partial q_k}{\partial a_i}\\
\end{align*}
$$

L即loss时一个数字，但是Q即概率是一个向量，这个向量里面的每个值都是一个关于A向量中所有值的函数，因此L对ai中实际上包含了Q的所有参数。因此需要这样计算：

$$
\begin{align*}
&L = f_Q([q_1,...,q_n]); \quad q_i = f_A([a_1,...,q_n]); \\
&因此按照偏导数的链式法则，应该这样计算：\\
&\frac{\partial L}{\partial a_i} = 
\frac{\partial L}{\partial q_1} \frac{\partial q_1}{\partial a_i} + 
\frac{\partial L}{\partial q_2} \frac{\partial q_2}{\partial a_i} ... +
\frac{\partial L}{\partial q_n} \frac{\partial q_n}{\partial a_i} \\
&= \sum_{k=1}^{n} \frac{\partial L}{\partial q_k}\frac{\partial q_k}{\partial a_i}
\end{align*}
$$

由于我们前面只求了Q和A中下标相等的场景，这里再求一下不相等时候的偏导数。

$$
\begin{align*}
\frac{\partial q_x}{\partial a_y} &= \frac{\partial (\frac{e^{a_x}}{\sum_{j=1}^{n}e^{a_j}})}{\partial a_y}
\quad 当x \ne y时 \\
&= -\frac{e^{a_x}e^{a_y}}{(\sum_{j=1}^{n}e^{a_j})^2} \\
&= -(\frac{e^{a_x}}{\sum_{j=1}^{n}e^{a_j}} \frac{e^{a_y}}{\sum_{j=1}^{n}e^{a_j}}) \\
&= -q_xq_y
\end{align*}
$$

那么现在分开的偏导数已经全部求出来了，现在将他们拼合起来，求L对于A的偏导数：

$$
\begin{align*}
\\ \\
\frac{\partial L}{\partial a_i} &= \sum_{k=1}^{n} \frac{\partial L}{\partial q_k}\frac{\partial q_k}{\partial a_i} \\
&= 0\frac{\partial q_1}{\partial a_i} + ... + 0\frac{\partial q_n}{\partial a_i} +
\frac{\partial L}{\partial q_x}\frac{\partial q_x}{\partial a_i} \\
&= -\frac{1}{q_x}\frac{\partial q_x}{\partial a_i} = 
\begin{cases} -\frac{1}{q_i}(q_i(1 - q_i)) & 当i=x\\ -\frac{1}{q_x}(-q_xq_i) &当i\ne x \end{cases} \\
&= \begin{cases} q_i-1 & 当i=x\\ q_i &当i\ne x \end{cases} \\
&= q_i-y_i \quad (当i = x时，y_i = 1；否则y_i = 0) \\
\\
\end{align*}
$$

费了一番功夫，这样我们就得到了和前面合并计算一样的梯度计算结果。虽然计算过程并不难，但确实比合并计算要麻烦，在模型实际运算中，因为合并计算公式简洁简单，因此都不选择分开计算。

### 雅可比矩阵
向量如何对向量或者矩阵求梯度呢？这就需要介绍雅可比矩阵，它对于梯度的理解有重要的作用。我们先抛开大模型，重新假设X向量对Y向量求偏导数的场景。
$$
\begin{align*}
&设 Y_{m\times 1} = [y_1, ..., y_m]，X_{n\times 1} = [x_1, ..., x_n] \\
&Y_{m\times 1} = f(X_{n\times 1})  \Longrightarrow 
\begin{cases} y_1 = f_1(x_1, ..., x_n) \\ y_2 = f_2(x_1, ..., x_n) \\ ...\\ y_n = f_n(x_1, ..., x_n) \\ \end{cases} \\
&则\frac{\partial y_i}{\partial x_j} = \frac{\partial (f_j(x_1, ..., x_n))}{\partial x_j} \\
\end{align*}
$$

可以看到，当函数输出值是一个向量时，就相当于每个输出值有一个独立的函数，入参是X向量的全部参数。在向量xi对向量yj求偏导时，相当于挑出第j个函数来计算偏导数。因为i和j是独立的，因此向量对向量的偏导数实际是一个m×n的矩阵：

$$
\begin{align*}
\frac{\partial Y_{m\times 1}}{\partial X_{n\times 1}} =  
\begin{bmatrix}  
\frac{\partial y_1}{\partial x_1}& \frac{\partial y_1}{\partial x_2}& \cdots & \frac{\partial y_1}{\partial x_n} \\  
\frac{\partial y_2}{\partial x_1}& \frac{\partial y_2}{\partial x_2}& \cdots & \frac{\partial y_2}{\partial x_n} \\  
  \vdots & \vdots & \ddots & \vdots \\  
\frac{\partial y_m}{\partial x_1}& \frac{\partial y_m}{\partial x_2}& \cdots & \frac{\partial y_m}{\partial x_n} 
\end{bmatrix}
\end{align*}
$$

这个矩阵就叫做雅可比矩阵。对应的我们前面计算过：单个数字对于向量求偏导，偏导数是向量；向量对于矩阵求偏导，结果是三维的雅可比张量；矩阵对矩阵求偏导，结果是四维雅可比张量。什么是张量？三维及以上维度的矩阵，就叫做张量。这也是深度学习相关工具（PyTorch，TensorFlow）中的数据表示形式。

### 线性层梯度计算和传播
我们求得logits向量的梯度，实际上只是反向传播的第一步。logits是大模型的“中间结果”，并不是我们直接要调整的参数，因此我们还要继续从后向前传播，算出前面每个参数的梯度值。这里我们以一个线性层来举例梯度在神经网络中是如何计算的。对于非线性层，也是类似的计算和传播方式。

设向量维度为m，则一个线性层的矩阵计算公式可以这样举例。其中Y是输出向量，X是输入向量，A和B分别是模型中的参数。（为了公式简单一点，这里统一维度为相同数字，实际大模型中经常是不同的，但计算方式一样，只不过公式写起来没这么好看）

$$
Y_{m\times 1} = A_{m\times m}X_{m\times 1} + B_{m\times 1}
$$

在前向传播中，我们以X作为自变量计算结果。但是在反向传播计算梯度时，计算哪个参数的梯度，哪个参数就要作为自变量，其余的参数则作为常量。为了方便理解，这里我们可以假设Y就是logits向量。假设要求loss对AB等参数的梯度，按照链式求导法则，我们已经求得了L对Y的偏导数，因此只需要求Y对A和B的偏导数即可。

在实际模型计算时，并不需要得到loss对AB等参数的真正梯度公式，只需要计算Y对于参数的梯度公式来就好了。因此在上一步logits向量的梯度计算后，我们拿到的是logits向量的梯度实际值，不需要再合并公式了。且模型层数越长，这个公式恐怕非常难表示。我们从简单的开始，首先对B求梯度。

$$
\begin{align*}
\frac{\partial Y}{\partial B} &= 
\begin{bmatrix}  
\frac{\partial y_1}{\partial b_1}& \frac{\partial y_1}{\partial b_2}& \cdots & \frac{\partial y_1}{\partial b_m} \\  
\frac{\partial y_2}{\partial b_1}& \frac{\partial y_2}{\partial b_2}& \cdots & \frac{\partial y_2}{\partial b_m} \\  
  \vdots & \vdots & \ddots & \vdots \\  
\frac{\partial y_m}{\partial b_1}& \frac{\partial y_m}{\partial b_2}& \cdots & \frac{\partial y_m}{\partial b_m} 
\end{bmatrix} \\
\because & y_j = AX + b \quad 当i\ne j时，b = 0 \\
&求偏导数时，AX为常数。因此i\ne j时，偏导数为0 \\
原式 &= \begin{bmatrix}  
1& 0& \cdots & 0 \\  
0& 1& \cdots & 0 \\  
  \vdots & \vdots & \ddots & \vdots \\  
0& 0& \cdots & 1
\end{bmatrix}
\end{align*}
$$

然后求Loss对于B的梯度。注意这里loss对Y的梯度是之前已经计算出的，这里直接套上实际的值来计算即可，没必要再合并公式了。且模型参数多层数长，这个公式恐怕非常难表示。

$$
\begin{align*}
\\
&\frac{\partial L}{\partial B} = \frac{\partial L}{\partial Y}\frac{\partial Y}{\partial B} \\
&= \begin{bmatrix}
\frac{\partial L}{\partial y_1} & \frac{\partial L}{\partial y_2} & ... & \frac{\partial L}{\partial y_m}
\end{bmatrix}
\begin{bmatrix} 1& 0& \cdots & 0 \\ 0& 1& \cdots & 0 \\  
\vdots & \vdots & \ddots & \vdots \\ 0& 0& \cdots & 1 \end{bmatrix}
=\begin{bmatrix}
\frac{\partial L}{\partial y_1} \\ \frac{\partial L}{\partial y_2} \\
... \\ \frac{\partial L}{\partial y_m}
\end{bmatrix}
\end{align*}
$$

然后再对A求梯度。因为A本身就是一个二维矩阵，因此雅可比张量是三维，这里就不列出张量了，我们直接写出矩阵中每个元素的偏导计算公式。（求对A偏导数时B直接变为0，因此这里就不列出了）

$$
\begin{align*}
\\
\frac{\partial y_k}{\partial a_{ij}} &= \frac{\partial (
\begin{bmatrix} a_{k1} & ... & a_{km} \end{bmatrix}
\begin{bmatrix} x_1 \\ ... \\ x_m \end{bmatrix}
)}{\partial a_{ij}} \\
&= \frac{\partial (a_{k1}x_1 + ... + a_{km}x_m)}{\partial a_{ij}} \\
&=\begin{cases} \frac{\partial (a_{i1}x_1 + ... + a_{im}x_m)}{\partial a_{ij}} & 当k=i
\\ \frac{\partial (a_{k1}x_1 + ... + a_{km}x_m)}{\partial a_{ij}} & 当k\ne i \end{cases} \\
&=\begin{cases} \frac{\partial (a_{ij}x_j)}{\partial a_{ij}} & 当k=i
\\ 0 & 当k\ne i \end{cases} \\
&= \begin{cases} x_j & 当k=i \\ 0 & 当k\ne i \end{cases}
\end{align*}
$$

然后我们再将L对Y的偏导数相乘，注意链式法则对于中间变量的连加。

$$
\begin{align*}
\frac{\partial L}{\partial a_{ij}} &= 
\sum_{k=1}^{m} \frac{\partial L}{\partial y_k}\frac{\partial y_k}{\partial a_{ij}} \\
&注意k从1到m遍历，必然遇到一次k = i \\
&= \frac{\partial L}{\partial y_i} \frac{\partial y_i}{\partial a_{ij}} = x_j\frac{\partial L}{\partial y_i}
\end{align*}
$$

可以看到对A和B求的梯度都是非常简洁的。然后我们还需要对X求梯度。为什么？X并不是参数，我们不会根据梯度调整它的值，为什么要计算呢？这是因为在大模型中不止一层网络，一个公式，它是由好多线性或者非线性的公式一层一层向下计算的，上一个公式的输出Y，也就是下一个公式的输入X。因此我们计算了本公式X的梯度之后，这个梯度就是上一个公式中Y的梯度。然后再根据相同的计算方式向上继续求梯度即可，这对于线性层和非线性层都适用。因此，中间结果即使不用来调整参数，梯度还是照样计算的。

$$
\begin{align*}
&设第一个函数的输出实际上就是第二个函数的输入，即Y_1=X_2\\
&Y_1 = A_1X_1 + B_1 \\
&Y_2 = A_2X_2 + B_2 \\
&则首先计算出
\frac{\partial L}{\partial X_2} = \frac{\partial L}{\partial Y_2}\frac{\partial Y_2}{\partial X_2} 
= \frac{\partial L}{\partial Y_1} \\
&则第一个公式就可以直接利用这个结果来计算梯度了：\\
&\frac{\partial L}{\partial A_1} = \frac{\partial L}{\partial Y_1}\frac{\partial Y_1}{\partial A_1} \\
&\frac{\partial L}{\partial B_1} = \frac{\partial L}{\partial Y_1}\frac{\partial Y_1}{\partial B_1} \\
&如果还需要向前传播，则需要计算出
\frac{\partial L}{\partial X_1} = \frac{\partial L}{\partial Y_1}\frac{\partial Y_1}{\partial X_1} \\
\end{align*}
$$

我们再来真正的计算出X的梯度结果。

$$
\begin{align*}
\\
\frac{\partial y_k}{\partial x_i} &= \frac{\partial (
\begin{bmatrix} a_{k1} & ... & a_{km} \end{bmatrix}
\begin{bmatrix} x_1 \\ ... \\ x_m \end{bmatrix}
)}{\partial x_i} \\
&= \frac{\partial (a_{k1}x_1 + ... + a_{km}x_m)}{\partial x_i} \\
&= \frac{\partial (a_{ki}x_i)}{\partial x_i}
= a_{ki}
\end{align*}
$$

最后求出loss对X的梯度结果。

$$
\begin{align*}
\frac{\partial L}{\partial x_i} &= 
\sum_{k=1}^{m} \frac{\partial L}{\partial y_k}\frac{\partial y_k}{\partial x_i} \\
&= \sum_{k=1}^{m} a_{ki}\frac{\partial L}{\partial y_k} \\
\end{align*}
$$

## 梯度下降与优化器
### 梯度下降法
通过反向传播拿到各个参数的梯度值之后，下一步就是更新参数值，以求获得更低的loss。最直观也是最简单的方式，就是了类比导数的定义，将梯度值乘一个微小量得到一个数字，参数值减去这个数字，作为一个新的参数值：

$$
\begin{align*}
\\
设：&\theta_{old}为当前参数值；\theta_{new}为新参数值；\eta 为学习率\\
\theta_{new} &= \theta_{old} - \left.\eta\frac{\partial L}{\partial \theta}\right|_{\theta=\theta_{old}}
\end{align*}
$$

其中学习率，就是这里的微小量，可以取值为0.001，0.0001等。它可以作为训练的超参数，一旦设定后训练过程中就不再变化。也可以使用学习率调度器，在训练的不同截断单独调整学习率（后面单独介绍）。这里为什么是减去梯度而不是加上梯度？试想导数的定义时当x增加微小量时，y变化的差值。如果y增大那么导数就是正的；y减小导数就是负值。上面公式如果是加梯度，那么就变成了增大Loss了。但我们目标是减小Loss值，因此要减去梯度。

梯度下降法(Gradient Descent‌)就是直接使用前面的公式来更新参数值的方法。根据平均值情况的不同，分为以下三个方法：

* SGD 随机梯度下降 Stochastic Gradient Descent
  * 一个样本就更新一次参数值
* MBGD 批量梯度下降 Mini-Batch Gradient Descent
  * 多个样本组合为一个batch，一个batch完成后计算一次梯度值
* BGD 小批量梯度下降 Batch Gradient Descent
  * 所有训练样本完成后再计算一次梯度值

例如我们训练集有10000个样本，SGD表示跑一个样本就更新一次；MBGD是跑batch个数据就更新一次（例如32 64 128等）；BGD表示跑完所有10000样本再更新一次参数。MBGD和BGD的公式可以用这样的形式表示，只不过数量的n的大小不同：

$$
\theta_{new} = \theta_{old} - \eta\frac{1}{n} \sum_{i=1}^{n} \left.\frac{\partial L_i}{\partial \theta}\right|_{\theta=\theta_{old}}
$$

实际上就是对n个样本计算的梯度求一个平均数，以这个平均数作为梯度来更新参数。由于大模型训练时样本数量比较大，整个训练完是需要花很长时间的，而且模型学习率也是很多，需要修改很多次才能对参数值有明显改动，如果使用BGD方法更新，那么首先训练时间就太长了，难以接受。

而SGD要求一次只能跑一个样本；但是为了加快训练时间，利用GPU并行计算能力，训练时一般都会将多个样本拼接起来组成一个batch，一起放入大模型中并行计算。这时候如果使用SGD，必须训练一个样本更新一次，就不能使用并行计算多个样本的能力了。因此，大模型训练中使用最多的还是MBGD。

注意，虽然我们是多个样本一起更新参数值，但是每个样本的梯度是单独计算的。因为在前面梯度计算的公式中可以看到，偏导数的值依赖于模型输入，正确值，以及模型计算的过程和中间结果，这些数据合起来叫做计算图。因此即使参数值相同时，模型对于不同输入的梯度值是不同的，因此训练时会把计算图暂存起来，对每个样本进行自己的反向传播计算梯度，最后再求平均，但实际计算时反向传播也是利用GPU并行计算能力，一次计算整个batch的梯度。

事实上，由于大模型跑一次只能输出一个token，因此一个样本内部也是并行多个位置的token，同时反向传播的。关于在这个我们会在后面的参数训练流程部分中提到。

### 梯度下降类比
前面关于梯度下降和偏导数的相关说明，相信很多同学是理解为什么要这么做的。但是网上很多同学也会拿下山这件事情来类比，这里我们也举例说明一下。

梯度下降法类似于：
* 你想以最快的速度从山顶下到最低点 -> 对应希望求最小的Loss值
* 但是你的眼睛被蒙住，看不到应该如何下山最快 -> 对应不知道全局最优解，也不知道函数应该表示为什么样子
* 因此只能一步一步尝试 -> 对应模型只能一批样本更新一次参数，训练很多次才能调整好参数
* 每次从最陡的方向下山一步 -> 对应每个参数的负梯度值，就是最陡的方向
* 每一步的大小 -> 学习率
* 当前所处的位置 -> 当前的参数值

因此，梯度下降法，确实很像蒙眼下山的场景。我们注意到其中一点：为什么参数的负梯度值，即减去梯度值，就是最陡的方向？换成数学的话来说，一个多元函数（即多参数函数），每个参数可以看作是一个维度；每个参数的偏导数作为这个方向的分量，将所有的参数的偏导数组合为一个向量，这个向量的方向就是函数当前上升最快的方向。对应大模型这里，就是这个向量的反方向就是函数当前下降最快的方向。

下面来证明这个结论。首先需要了解全增量和全微分的概念。

$$
\begin{align*}
&设：X为n个参数组成的向量，展开表示为[x_1, ..., x_n] \\
&\bigtriangleup X为向量增加一个微小量，展开表示为[\bigtriangleup x_1, ..., \bigtriangleup x_n] \\
&z为函数值，在大模型场景中即为loss；\\
&\bigtriangleup z为函数值在\bigtriangleup X下的变化量\\
&公式表示为：z = f(X) \\
\\
&全增量: \bigtriangleup z = f(X + \bigtriangleup X) - f(X) \\
&全微分: dz = \sum_{i=1}^{n}\frac{\partial z}{\partial x_i}\bigtriangleup x_i \\
&= \frac{\partial z}{\partial x_1}\bigtriangleup x_1 + ... + \frac{\partial z}{\partial x_n}\bigtriangleup x_n \\
\\
&\bigtriangleup z \approx dz \\
&当 \bigtriangleup X \longrightarrow 0时，\bigtriangleup z - dz = 二阶及以上的无穷小量 \\
\end{align*}
$$

可以看到，全增量就是函数在入参遇到微小变化时，实际的函数值变化。全微分则是这个微小变化用每个参数的微分*变化值来线性的近似全增量的值。他们的差值是这个微小变化的二阶无穷小，基本可以忽略不计。带入梯度下降法场景，全增量是我们实际参数调整后模型的结果，全微分是我们希望参数调整后的模型的结果，它们是近似的。再用蒙眼下山场景类比，全增量是是我们实际踏出的一步走的海拔变化，全微分是我们走之前预估走的海拔变化。

$$
\begin{align*} 
&设：\nabla f(x) 或 \nabla f 为X的偏导数组成的向量，
展开表示为[\frac{\partial z}{\partial x_1}, ..., \frac{\partial z}{\partial x_n}] \\
&dz = \frac{\partial z}{\partial x_1}\bigtriangleup x_1 + ... + \frac{\partial z}{\partial x_n}\bigtriangleup x_n \\
&= \begin{bmatrix} \frac{\partial z}{\partial x_1} & ... & \frac{\partial z}{\partial x_n} \end{bmatrix} \cdot 
\begin{bmatrix} \bigtriangleup x_1 \\ ... \\ \bigtriangleup x_n \end{bmatrix}
= \nabla f \cdot \bigtriangleup X
\end{align*}
$$

可以看到，全微分可以表示为两个向量相乘，我们的目标是让向量相乘之后的值最大（加负号之后就变为了值最小）。在几何的维度下，两个向量相乘可以表示为两个向量的长度乘以cos夹角值：

$$
\begin{align*} 
\\
&设：\theta 为两个向量夹角 \\
&\nabla f \cdot \bigtriangleup X = |\nabla f| |\bigtriangleup X| \cos \theta \\
\end{align*}
$$

那什么时候乘积的值最大和最小呢，就是cosθ = 1和-1的时候。即两个向量的夹角为0度和180度，那也就是说X向量增加一个微小量ΔX的方向，即每个参数增长的比例，和梯度的方向一致时，值的增长最大；方向相反时，值的减小最大。因此按照负梯度值的方向下山，是最陡的方向，也是Loss值下降最快的方向。最后我们拿一个二元函数来举例：

$$
\begin{align*} 
z = x^2+y^2 \\
\frac{\partial z}{\partial x} = 2x \\
\frac{\partial z}{\partial y} = 2y
\end{align*}
$$

​![](/2026/lora-theory-5.png)


这个函数的三维图像如上，是一个类似于锅的形状，最低点为(0,0)，越往外围值越大。此时我们求三个点的值和梯度：

$$
\begin{align*}
&(1, 1) &\quad z = 2 \quad \frac{\partial z}{\partial x} &= 2 \quad &\frac{\partial z}{\partial y} &= 2 \\
& &梯度向量&(2, 2)\\
&(1, -1) &\quad z = 2 \quad \frac{\partial z}{\partial x} &= 2 \quad &\frac{\partial z}{\partial y} &= -2 \\
& &梯度向量&(2, -2)\\
&(-1, -1) &\quad z = 2 \quad \frac{\partial z}{\partial x} &= -2 \quad &\frac{\partial z}{\partial y} &= -2 \\
& &梯度向量&(-2, -2)\\
\end{align*}
$$

这里的梯度向量，实际上就是在坐标轴上的方向，注意这里只是表示方向，不表示位置，因此梯度值为(2,2)和(1,1)是没有方向的区别的。但是梯度向量值的大小会影响走多大的步。对应在图上，就是(1, 1)的点往x轴正向45度，y轴正向45度时，z值增长最大；(1, -1)的点时，x轴正向45度，y轴负向45度时，z值增长最大。

​![](/2026/lora-theory-6.png)

对应到图上，就是xy平面上有很多方向，x和y值往哪个方向走，z值增长最快。可以看到绿色箭头对应的在曲面上的投影是z值增加最快的方向，其它蓝色箭头的投影低一些，有的还会让z值减小。

### 梯度下降缺陷
使用梯度下降法来更新参数，看似简洁又好用，但是也存在一些问题。

局部最优点问题

震荡问题


### Adam和AdamW

### 学习率调度器

## 参数训练流程

### batch之类的介绍

### 一个样本一格一格跑

### 总体参数流程图

## 总结

1. 还有很多在LoRA基础上改进的方法
2. 这里讲的参数训练流程，包括损失函数，梯度，优化器等，都只讲了大模型中常用的一个方法，事实上这些流程中涉及到的方法有很多。
2. 虽然之前听很多人说神经网络算法不可解释，但没想到实际上这些算法原理全都是数学
3. 虽然是数学，但也不怎么难，这篇文章中我涉及的公式，基本也就是大学高等数学的水平。
4. 不过也有一些难的公式我没有讲，因为理解这些对于原理来说已经足够了，且不能一开始希望把所有东西都搞懂，要循序渐进的学习。
5. 我或许应该读研的时候就按照这种学习方式，或许人生路径会有另一种结果呢
6. 搞清楚原理是一回事，代码实现是一回事，能不能通过实验得到好结果是另一回事。
7. 我喜欢把计算过程陡展示出来，在不限制文章长度的情况下，不喜欢太多“略”，“显而易见”等。毕竟有可能我现在懂，但是后面再看的时候，这些显然易见我自己可能也证明不出来了。

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
- 图解 Fine-tuning：LoRA 系列微调技术概述\
  https://zhuanlan.zhihu.com/p/990958034
- LoRA: Low-Rank Adaptation of Large Language Models\
  https://arxiv.org/abs/2106.09685
- LoRA论文对应代码\
  https://github.com/microsoft/LoRA
- 什么是信息量、信息熵、交叉熵与KL散度，及其相互之间的关系\
  https://www.bilibili.com/video/BV1mkgwzZEN9
- 别死记公式！8分钟带你通透损失函数本质！\
  https://www.bilibili.com/video/BV1GHS1BzE6J
- 全微分 百度百科\
  https://baike.baidu.com/item/全微分/8155184
