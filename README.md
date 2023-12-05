1.公众号分为两种类型：订阅号，服务号。

> 订阅号：更多是个人账号使用
> 服务号：企业或组织使用，
> 订阅号的功能是服务号的功能的子集

订阅号可以迁移为服务号，需要重新注册一个服务号后迁移，不能升级。

为指定 openid 用户发送消息实现方式有两种：

1. 客服消息(订阅号、服务号)
   [文档地址](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Service_Center_messages.html#7)
   触发场景后，在有效时间内，可发送消息给指定用户。
   流程：用户触发 => 微信服务器 => 我们的服务器 => 创建或者选择一个“客服” => 客服回复消息 => 微信服务器 => 用户
   **限制**
   场景 | 下发额度(条) | 有效期
   用户发送消息 | 5 | 48 小时
   点击自定义菜单 | 3 | 1 分钟
   关注公众号 | 3 | 1 分钟
   扫描二维码 | 3 | 1 分钟

(测试后)有效期：触发场景动作下的有效时间，比如触发了用户发送消息后，在 48 小时内，可以不停发送消息给用户. 2. 模版消息(服务号)
[文档地址](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html)
发送固定模版样式的消息给用户。
流程: 我们服务器 => 微信服务器(生成模版消息) => 用户
**限制**
10 万条/天

[测试代码]()

Intsall Bun
[Bun](https://bun.sh)

````
To install dependencies:

```bash
bun install
````

To run:

```bash
bun run index.ts
```
