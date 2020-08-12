# Incremental Coverage

![](https://img.shields.io/github/license/matmanjs/incremental-coverage) ![](https://img.shields.io/github/languages/code-size/matmanjs/incremental-coverage)


本应用结合 `lcov.info` 与 `Git Diff` 得到仓库的增量覆盖率数据。

- [快速开始](#quick-start)-快速得到一份测试报告
- [API](#api)-介绍暴露出来的 API 与配置选项

Incremental Coverage 适用于 macOS、Windows 和 Linux。

如果 Incremental Coverage 不能正常工作，请提交 [issue](https://github.com/matmanjs/incremental-coverage/issues/new)。

## Quick Start

### 安装

可以通过 [NPM](https://github.com/npm/cli) 或者 [Yarn](https://github.com/yarnpkg/yarn) 进行安装。

```sh
$ npm install -g incremental-coverage
# or
$ yarn add global incremental-coverage
```

### 使用

我们通过一个简单的命令行工具来展示如何使用（必须在 Git 仓库根目录中运行，且指定 lcov 文件）。

```sh
$ git-parser -p="./.dwt_output/e2e/coverage/lcov.info" -t="2020-06-01"
```

- 上面这条命令指定 `./.dwt_output/e2e/coverage/lcov.info` 覆盖率文件
- 并且指定了 `2020-06-01` 增量起始时间
- 运行这个命令将会在根目录输出一个 `output.json` 文件，文件示例如下：

```json
{
  "total": { "increLine": 2, "covLine": 2, "increRate": "100.00%" },
  "files": [
    {
      "increLine": 2,
      "covLine": 2,
      "increRate": "100.00%",
      "detail": [
        { "number": 5, "hits": 73 },
        { "number": 71, "hits": 45 }
      ],
      "name": "/src/datas/action.js"
    }
  ]
}
```

`total` 为增量覆盖率的总情况，`files` 中是各个文件的详细情况。

## API

> 提供 `命令行` 与 `Node.js` 调用两种形式

## License

Incremental Coverage 使用 [MIT 开源协议](https://github.com/matmanjs/incremental-coverage/blob/master/LICENSE)。

