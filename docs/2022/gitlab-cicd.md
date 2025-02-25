# GitLab持续集成部署CI/CD初探：如何自动构建和发布个人前端博客

## 简介
持续集成，持续部署简写为CI/CD，指的是代码频繁提交，且自动部署到生产环境。关于这些概念，阮一峰在博客中有讲（[持续集成是什么？](https://www.ruanyifeng.com/blog/2015/09/continuous-integration.html)），这里就不再赘述了。

目前的GitLab也提供了CI/CD的工具，[Easy-Serverless应用部署平台](https://juejin.cn/post/7057114641507287048)也提供了自动部署的辅助工具，因此我就用博客尝试一下。由于Serverless只提供内网访问，因此本文不涉及Serverless具体细节和地址。而且通过CI/CD，也可以使用Gitlab Page直接在Gitlab中发布博客。

## 博客使用CI/CD能做什么
我用的Serverless平台需要把构建后的dist文件夹中的内容放入GitLab。如果不想污染git库，就只能新建一个分支或者新建一个git库存放dist。这样，每次写博客需要做的步骤如下：  
* 步骤1. 撰写博客
* 步骤2. 提交代码到git
* 步骤3. 构建build
* 步骤4. 提交构建成果到git
* 步骤5. Serverless平台重新部署

通过CI/CD这些繁琐的流程可以自动化，实现自动提交，自动构建，自动部署。

* 通过脚本自动化流程 可以自动化 步骤2-步骤5
* 通过GitLab的持续集成工具 可以自动化 步骤3-步骤5
* 通过CI/CD，也可以使用Gitlab Page直接在Gitlab中发布博客。

## 使用脚本自动化流程
这一部分是使用PowerShell脚本（适用于Windows环境，Linux下少许改动即可）在本地进行流程的自动化，不使用GitLab工具。只要执行一句话，就能实现“一键完成所有事情”。
```shell
yarn deploy:win
```

### 自动化脚本
在项目根目录创建autoDeploy.bat，内容如下：

```shell
git add .
git commit -m "auto update blog"
git push origin master

call yarn docs:build

cd docs/.vuepress/dist

git init
git add -A
git commit -m "auto construct blog"
git push -f http://XXXX.com/xxxx-blog.git master:gl-pages

cd ../../../
yarn deploy:xxx
```
### 自动化步骤2
前三行是常规的git代码提交脚本，提交VuePress博客代码到git。

### 自动化步骤3
```shell
call yarn docs:build
cd docs/.vuepress/dist
```
这一部分是VuePress的构建命令，构建的结果存放在docs/.vuepress/dist文件夹中。  
构建命令前需要加call命令，否则构建完之后，脚本会自动结束，不执行后续的命令。  

### 自动化步骤4
```shell
git init
git add -A
git commit -m "auto construct blog"
git push -f http://XXXX.com/xxxx-blog.git master:gl-pages
```
这部分是提交构建成果到git库。  
创建一个git库，添加所有代码，commit后强制提送到GitLab库中gl-pages分支。

### 自动化步骤5
这部分是自动化部署到Serverless平台。serveless提供了辅助脚手架工具，具体细节这里就不介绍了，可以参考其他Serverless工具。

最后在项目的package.json的scripts中加入：

```js
"scripts": {
  "deploy:win": "powershell ./autoDeploy.bat",
  "deploy:xxx": "xxx xxx",
  // .... 其他命令
}
```
deploy:xxx是执行自动化部署的命令。deploy:win是执行整个脚本的命令，后面会用到。

```shell
cd ../../../
yarn deploy:xxx
```

脚本中最后两行是返回到项目根目录，执行自动化部署。

### 小结
至此，就已经实现了步骤2到步骤5的自动化处理。这也是我一开始的做法。当然，所有提交记录都是"auto construct blog"有点不好看，可以在package.json的scripts脚本中加入传入参数功能来实现自定义提交描述。

如果只关心自动化构建和发布博客，而不想了解Git持续集成的方法，那么目前这种方法已经可以实现了。如果希望了解如何使用GitLab的集成工具来做到这些事，那么可以看下一种方法。

## 使用GitLab的持续集成工具

使用GitLab的持续集成工具，实际上也是在自己的电脑上执行类似的脚本，只不过变成了在push代码的时候自动执行。  

### 安装和配置GitLab Runner
GitLab Runner 是一个与 GitLab CI/CD 一起使用以在管道中运行作业的应用程序，[下载和文档地址](https://docs.gitlab.com/runner/)。特别的，[在Windows系统上安装的方法地址](https://docs.gitlab.com/runner/install/windows.html)。下载之后直接放到系统中某个固定的位置即可。

然后去我们的GitLab库，在Settings >> CI/CD >> Runners 中找到 Set up a specific Runner manually。

![图片](/2022/gitlab-cicd-1.png)

然后注册和启动注册GitLab Runner。图中的2和3分别作为URL和token，在注册的命令行中输入。GitLab Runner执行命令需要管理员权限。

```powershell
C:\>gitlab-runner.exe register
Runtime platform                                    arch=amd64 os=windows pid=3756 revision=c6e7e194 version=14.8.2
Enter the GitLab instance URL (for example, https://gitlab.com/):
http://xxxx.com/
Enter the registration token:
XXXXXXXXXXXXX
Enter a description for the runner:
[PC-xxxxx]:
Enter tags for the runner (comma-separated):

Enter optional maintenance note for the runner:

Registering runner... succeeded                     runner=Jxu_vhSj
Enter an executor: docker-ssh+machine, kubernetes, docker-ssh, shell, virtualbox, docker+machine, ssh, custom, docker, docker-windows, parallels:
shell
Runner registered successfully. Feel free to start it, but if it's running already the config should be automatically reloaded!
```

但是这个设置在Windows环境中会出现问题，因此打开gitlab-runner.exe同级目录的config.toml，修改配置runners配置中的shell为powershell。

```toml
executor = "shell"
shell = "powershell"
```

最后再启动GitLab Runner。

```shell
C:\>gitlab-runner.exe install
Runtime platform                                    arch=amd64 os=windows pid=18064 revision=c6e7e194 version=14.8.2

C:\>gitlab-runner.exe start
Runtime platform                                    arch=amd64 os=windows pid=9560 revision=c6e7e194 version=14.8.2
```

### 配置 .gitlab-ci.yml

在项目根目录创建.gitlab-ci.yml，内容参考上面的autoDeploy.bat。

```yaml
deploy:
  cache:
    paths:
      - node_modules/
  script:
    - yarn install
    - yarn docs:build
  after_script:
    - cd docs/.vuepress/dist
    - git init
    - git add -A
    - git commit -m "auto construct blog"
    - git push -f http://xxxxx:$PASSWORD@xxxxx.com/xxxx/xxxx-blog.git master:gl-pages
    - cd ../../../
    - yarn deploy:xxxx
  only:
    - master
```

可以看到，这就是把上面步骤3-步骤5的脚本写到了gitlab-ci中。但是还有一些不同点：  
* 代码和命令的执行位置并不在我们项目本身所在的位置，而是在GitLab Runner指定的其他位置，例如我在日志中看到的位置。

```shell
$ git init
Initialized empty Git repository in C:/builds/HEAJXxhy/0/[MASKED]/xxxx-blog/docs/.vuepress/dist/.git/
```

因此我们必须加入安装依赖的命令，如yarn install。

* 每次都重新安装依赖花费时间较长，可以把node_modules作为缓存保存下来，不用每次全部重新安装，节约构建时间。

* 我们直接使用脚本执行命令时，我们在windows环境自动赋予了我们Git的权限，因此我们不用输入Git账号密码。但是在GitLab Runner中执行的命令是没有Git权限的。因此我们必须加入账号密码。

```shell
git push -f http://账号:密码@xxxx.com/xxxx/xxxx-blog.git master:gl-pages
# 例如
git push -f http://xxxx:$PASSWORD@xxxx.com/xxxx/xxxx-blog.git master:gl-pages
```

但是这个.gitlab-ci.yml是其他人都能看到的，不能直接明文下入密码。因此我们会用到GitLab提供的变量功能。在Settings >> CI/CD >> Variables。我们增加密码变量，设置保护。然后在.gitlab-ci.yml中用$Key来替换变量。这样无论在.gitlab-ci.yml中还是在日志中，都会隐藏真实的密码。

![图片](/2022/gitlab-cicd-2.png)

* 注意要设置只有master分支才执行，否则我们代码中的git push命令可能会引起无限循环。

### 触发CI和查看效果
我们把刚写的代码提交，然后在GitLab上查看效果。

```shell
E:\personalProject\xxxx-blog>git add .
E:\personalProject\xxxx-blog>git commit -m "测试提交"
E:\personalProject\xxxx-blog>git push
```
提交后，在GitLab的 提交记录中可以看到后面有个图标。其中扇形表示正在进行中，对号表示成功。叉号表示失败，Pending一般表示GitLab Runner没有生效。

![图片](/2022/gitlab-cicd-3.png)

我们点击图标，进入另一个页面，再点击deploy框，就能看到具体的日志。

![图片](/2022/gitlab-cicd-4.png)

等执行成功后，我们再去看看我们的博客，就已经成功更新啦。

## 自动生成GitLab Pages
GitLab本身就给我们提供了搭建静态博客的功能，就是GitLab Pages。GitLab Pages需要通过上面所描述的CI配置的方法来生成。

### 修改VuePress配置
在生成GitLab Pages之后，我们的GitLab博客网址后将会以库名作为GitLab子路径名。比如我的库名字叫做：xxxx-blog。最后我生成的GitLab Pages的网址为http://xxxx/xxxx-blog/。

所以我们要在docs/.vuepress/config.js中设置base。注意应当总是以斜杠开始，并以斜杠结束。
```js
module.exports = {
  base: '/xxxx-blog/',
  // ....其他配置
}
```

### 更新配置 .gitlab-ci.yml
```yaml
pages:
  cache:
    paths:
      - node_modules/
  script:
    - yarn install
    - yarn docs:build
  after_script:
    - cd docs/.vuepress/dist
    - git init
    - git add -A
    - git commit -m "auto construct blog"
    - git push -f http://xxxxx:$PASSWORD@xxxxx.com/xxxx/xxxx-blog.git master:gl-pages
    - cd ../../../
    - yarn deploy:xxxx
    - mkdir -p public
    - cp -r -Force docs/.vuepress/dist/* public/
  artifacts:
    paths:
      - public
  only:
    - master
```

修改的部分如下：  
* 过程名需要改成pages。
* 需要增加 artifacts配置保存成果物。GitLab Pages 只支持路径是 public。
* 脚本中新增创建public文件夹，复制dist到文件夹中的命令。

注意，Windows和Linux脚本命令可能是不同的，而且powershell和cmd的命令也可能是不同的。我这里使用的是powershell命令。

### 查看结果

这样我们就实现了自动更新GitLab Pages的博客。  
GitLab Pages博客的查看方式为:  
去我们的GitLab库，在Settings >> Pages中，点击这里的网址，就能看到发布的博客啦。

## 同时支持Easy-Serverless和GitLab Pages
我们修改了配置，实现了自动更新GitLab Pages的博客后，我们就会发现之前配置Serverless平台的博客无法正常访问了，部分资源获取失败。这是由于我们配置在VuePress中配置了base，但是这个配置与Serverless平台冲突。

而VuePress中的base设置是构建的时候使用的，因此我们可以使用不同的base配置构建两次。当然这个过程也要自动执行。（我觉得这个办法有点笨，但是暂时还没找到更好的办法）

### 选用不同的Base配置
首先修改docs/.vuepress/config.js中的base配置。
```js
const env = process.env;
const isGitLabPage = env.DIST_ENV === 'gitlab-page';
module.exports = {
  base: isGitLabPage ? '/xxxx-blog/' : '/',
  // ....其他配置
}
```
取到环境变量DIST_ENV，如果值为'gitlab-page'，表示生成GitLab Pages的场景，设置特殊的base值。

然后安装cross-env，设置环境变量使用。
```powershell
yarn add -D cross-env
```

最后设置package.json的scripts。
```js
"scripts": {
  "docs:dev": "vuepress dev docs",
  "docs:build": "vuepress build docs",
  // 新增的 build-gitlab
  "docs:build-gitlab": "cross-env DIST_ENV=gitlab-page vuepress build docs",
  "deploy:win": "powershell ./autoDeploy.bat",
  "deploy:xxx": "xxx xxx",
  // .... 其他命令
}
```
新增加了docs:build-gitlab命令，当执行这条命令时，表示生成GitLab Pages的场景，设置特殊的环境变量再构建。

### 修改 .gitlab-ci.yml
```yml
pages:
  cache:
    paths:
      - node_modules/
  script:
    - yarn install
    - yarn docs:build
    - cd docs/.vuepress/dist
    - git init
    - git add -A
    - git commit -m "auto construct blog"
    - git push -f http://xxxxx:$PASSWORD@xxxxx.com/xxxx/xxxx-blog.git master:gl-pages
    - cd ../../../
    - yarn deploy:xxxx
    - yarn docs:build-gitlab
    - mkdir -p public
    - cp -r -Force docs/.vuepress/dist/* public/
  artifacts:
    paths:
      - public
  only:
    - master
```

流程被修改为：
 * 第一次正常构建，上传gl-pages分支，供Serverless平台使用。
 * 第二次使用build-gitlab构建，放入public文件夹，供GitLab Pages使用。

CI/CD可以做很多很多事情，GitLab或GitHub提供工具的实际应用场景也远比我这里的博客复杂的多，这里仅仅是一次小小的尝试。

## 参考

- 持续集成是什么？ —— 阮一峰  
  https://www.ruanyifeng.com/blog/2015/09/continuous-integration.html
- easy-serverless 功能分析  
  https://juejin.cn/post/7057114641507287048
- GitLab Runner 文档  
  https://docs.gitlab.com/runner/
- GitLab Runner 在Windows系统上安装的方法  
  https://docs.gitlab.com/runner/install/windows.html
- VuePress文档，静态资源  
  https://vuepress.vuejs.org/zh/guide/assets.html
- npm scripts 使用指南 —— 阮一峰  
  http://www.ruanyifeng.com/blog/2016/10/npm_scripts.html
