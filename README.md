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
$ incremental-coverage -p="./.dwt_output/e2e/coverage/lcov.info" -t="2020-06-01"
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

### 命令行

CLI 没有子命令只有最简单的三个选项：

- `--path、-p`：指定 lcov.info 文件的路径
- `--time、-t`：执行增量计算的开始时间（建议不要太长）
- `--output、-o`：结果的输出方式，可以选择 `file 与 stdio`，默认为 file

### API

>  Incremental Coverage 对外暴露两个 API 与三个 Parser

#### getIncrease

##### params

- `path`：lcov.info 文件的路径
- `opts`：配置选项
  - `cwd`：String，git 命令运行的路径
  - `since`：String，增量起始计算时间
  - `output`：Boolean，是否需要输出
  - `stream`：Object，针对输出流的配置
    - `name`：file 或者 stdio
    - `opts`：包含 `type` 输出格式，可选 `json`、`yaml`；`filePath`（name 为 file 时生效）指定输出文件路径；`ioType`（name 为 stdio 时生效），可选 stdout、stderr

##### return

格式化后的数据，与上面的示例文件保持一致

#### getIncreaseSync

与 `getIncrease` 保持一致，不过为同步方法，不推荐使用

>Parser 统一实现 Parser 接口，仅仅暴露一个 run 方法

#### DiffParser

返回格式化的 Git Diff 数据

#### LogParser

返回格式化的 Git Log 数据

#### LcovParser

返回格式化的 Lcov 数据

## License

Incremental Coverage 使用 [MIT 开源协议](https://github.com/matmanjs/incremental-coverage/blob/master/LICENSE)。

