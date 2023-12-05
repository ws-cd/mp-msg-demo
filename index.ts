import { setInterval } from "timers";
import xmljs from "xml-js";

/// dev
//ssh -R 50000:localhost:8080 username@hostname

let count = 0;
const config = {
  token: "eyJfYWlkIjoiYWM2MHJq",
  appID: "wx57a622fd5d94ed97", // 测试
  appsecret: "d074854419ba00d36d4aff2fb7db08cd", // 测试
};
async function init() {
  /// 刷新access_token
  const { access_token } = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appID}&secret=${config.appsecret}`
  ).then((res) => res.json());
  const kfs = await fetch(
    `https://api.weixin.qq.com/cgi-bin/customservice/getkflist?access_token=${access_token}`
  ).then((res) => res.json());
  /// 创建客服
  if (kfs.length === 0) {
    await fetch(
      `https://api.weixin.qq.com/customservice/kfaccount/add?access_token=${access_token}`,
      {
        method: "post",
        body: JSON.stringify({ kf_account: "test1@test", nickname: "客服1" }),
      }
    ).then((res) => res.json());
  }

  /// start server
  Bun.serve({
    port: 8080,
    fetch: async (request: Request): Promise<Response> => {
      const { url: requestUrl, method } = request;
      const url = new URL(requestUrl);
      console.log("request url", url.pathname, "method", method);

      if (url.pathname === "/") {
        // 验证通讯信息是否来自微信服务器
        const { signature, timestamp, nonce, echostr } = Object.fromEntries(
          url.searchParams.entries()
        );
        // token, timestamp, nonce 字典排序后拼接成字符串后sha1加密，对比 signature
        const crypter = new Bun.CryptoHasher("sha1");
        crypter.update([config.token, timestamp, nonce].sort().join(""));
        const that = crypter.digest("hex");
        if (that === signature) {
          console.log("验证来自微信服务器成功");
          if (method.toLocaleLowerCase() === "get") {
            // 初始化配置时，需要返回原样返回 echostr
            return new Response(echostr);
          }
          if (method.toLocaleLowerCase() === "post") {
            // 接受消息或者事件
            const text = await request.text();
            const { xml } = JSON.parse(xmljs.xml2json(text, { compact: true }));

            const {
              MsgType: { _cdata: msgType },
              FromUserName: { _cdata: openId },
              Event: event,
            } = xml;
            if (msgType === "event") {
              if (event && event._cdata === "subscribe") {
                console.log(`用户[${openId}]关注公众号`);
                await fetch(
                  `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${access_token}`,
                  {
                    method: "post",
                    body: JSON.stringify({
                      touser: openId,
                      msgtype: "text",
                      text: {
                        content: `感谢关注公众号: 1分钟时间内,发送有效`,
                      },
                    }),
                  }
                ).then((res) => res.json());
                // 开启模版推送消息

                setInterval(async () => {
                  const result = await fetch(
                    `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`,
                    {
                      method: "post",
                      body: JSON.stringify({
                        touser: openId,
                        template_id:
                          "bUf1kXqouvSGs3zeaEzAx15THz5B3En7m-v7q0ChuTY",
                        data: {
                          content: {
                            value: `模版消息测试: ${count}`,
                          },
                        },
                      }),
                    }
                  ).then((res) => res.json());
                  console.log(`发送模版消息(${count})\n`, result);
                  count++;
                }, 5 * 1000);
              }
            }
          }
        }
      }

      const res = Response.json({ message: "未找到" });
      res.headers.set("status", "404");
      return res;
    },
    error: () => {
      const res = Response.json({ message: "服务器错误" });
      res.headers.set("status", "500");
      return res;
    },
  });
}
init();
