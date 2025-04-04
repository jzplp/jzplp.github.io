# 是天坑还是新技术？机械硬盘中的SMR叠瓦盘技术究竟如何？

好久没有写硬件相关的文章了，恰巧前几天看到知乎上有关于叠瓦盘的声讨的帖子，于是了解了一下。

在叠瓦盘出现之前，机械硬盘的数据记录方式是PMR(Perpendicular Magnetic Recording)，也叫作“垂直磁记录”。
​​​![图片](/2020/smr-1.png)
PMR示意图

如图，蓝色的表示磁盘写入的部分，橙色的表示磁盘读取的部分。一般为保证读取正常，写入的部分会比读取的部分大一些。

在PMR的情况下，不同的磁道不会互相干扰，可以直接进行随机存取。

当然，更早的还有LMR(Longitudinal magnetic recording)，“水平磁记录”，与垂直磁记录的区别是磁性粒子的方向不同，一个水平，一个垂直。PMR比LMR更先进。LMR和PMR的区别与本题无关，就不在这里描述了。

我们可以看到，由于两个磁道之间的空隙，读取和写入宽度的差值，有一部分的磁盘空间实际上被浪费了。

为了把这一部分磁盘空间利用起来，一种新的磁记录方式，叫做SMR(Shingled Magneting Recording)，“叠瓦式磁记录”出现了。顾名思义，SMR方式的写入磁道是重叠的，一片一片叠起来就像瓦片一样。
​​​![图片](/2020/smr-2.png)
SMR示意图

通过这种方式，闲置的磁盘空间被利用起来了，同样的磁盘面积可以有更多磁道，可以存储更多数据。据统计，SMR的存储密度可以提高25%。

由于读取的宽度小，因此这种方式对于数据读取没有任何影响。

如果使用SMR进行顺序存储，也就是按照磁道的顺序一层一层进行写入，写入数据的时候下层磁道中没有数据，即使抹去也不会有任何影响。

但如果是随机存储的情况，就有影响了。由于写入磁道是重叠的，因此对某个磁道进行写入时，会抹去其它磁道的数据。
​​​![图片](/2020/smr-3.png)
写入抹去磁道示意图

如图中所示，对中间的磁道进行写入，蓝色覆盖了下一层的橙色区域。这样会影响下面磁道读取对应区域的数据。因此，如果要实现随机存储，必须把下面磁道对应扇区的数据先取出，再进行写入。

这样相对于PMR，SMR的随机写入时间会大大增加，磁盘的转速也不能太高。而且因为要保存可能被抹去的数据，因此需要更大的缓存空间。目前一般是256MB。

而且为了防止随机写入造成的更多影响，磁盘写入的算法更复杂，对磁盘写入的次数会增加，会造成磁盘寿命下降，相对于PMR方式来说更容易坏。

这样，PMR的优势就只有——存储容量高。体现在产品上就是同样的存储容量，价格更便宜。但是缺点有很多：随机写入速度慢很多，磁盘寿命低等等。

因此，SMR硬盘一般更适合作为仓库盘，存储一些体积大，不经常写入的资料。如果日常使用的磁盘，还是建议使用PMR，或者直接使用固态硬盘。


而目前市场上机械硬盘产品上一个很大的问题就是——PMR和SMR混用。厂商不标明是PMR还是SMR，消费者无法判断。而且消费者一看SMR的硬盘缓存更高，还以为是更好的硬盘，但实际上性能更低。

目前，西部数据和希捷等部分厂商在官网还是标注了采用的技术。比如下面希捷的例子：
​​​![图片](/2020/smr-4.png)
希捷官网图
​​​![图片](/2020/smr-5.png)
西部数据官网图

西部数据这里的截图是蓝盘，其中的CMR应该指的就是PMR技术。

从这个图里可以看到，容量越大，越容易用SMR。（其他品牌或者系列不一定）

那么厂商为什么要采用看起来性能更差的SMR技术呢？

我猜是因为固态硬盘的冲击。（仅指消费级产品）

在固态硬盘流行之前，大家都用机械硬盘装系统，玩游戏，处理事务，自然对机械硬盘的速度要求高，越快越好。

但是现在，固态硬盘的速度相比于机械硬盘超过很多倍，机械硬盘无论怎么在速度上提高，都不可能超过固态硬盘。大部分同学都将系统装在固态硬盘中，机械硬盘仅仅用来存放资料。

那么机械硬盘快一点，对于厂商又有何用？机械硬盘目前的优势就是同容量的价格比固态硬盘更便宜。而SMR技术可以进一步提高容量。

或者在不实际提高容量，不降低价格的情况下，提高厂商的利润。

但对于消费者，如果价格相差不大，还是建议购买PMR的机械硬盘。
