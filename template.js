// === xream sing-box template.js (patched with urltest) ===
// https://raw.githubusercontent.com/xream/scripts/main/surge/modules/sub-store-scripts/sing-box/template.js#type=组合订阅&name=机场&outbound=🕳ℹ️all|all-auto🕳ℹ️hk|hk-auto🏷ℹ️港|hk|hongkong|kong kong|🇭🇰🕳ℹ️tw|tw-auto🏷ℹ️台|tw|taiwan|🇹🇼🕳ℹ️jp|jp-auto🏷ℹ️日本|jp|japan|🇯🇵🕳ℹ️sg|sg-auto🏷ℹ️^(?!.*(?:us)).*(新|sg|singapore|🇸🇬)🕳ℹ️us|us-auto🏷ℹ️美|us|unitedstates|united states|🇺🇸

// 示例说明
// 读取 名称为 "机场" 的 组合订阅 中的节点(单订阅不需要设置 type 参数)
// 把 所有节点插入匹配 /all|all-auto/i 的 outbound 中(跟在 🕳 后面, ℹ️ 表示忽略大小写, 不筛选节点不需要给 🏷 )
// 把匹配 /港|hk|hongkong|kong kong|🇭🇰/i  (跟在 🏷 后面, ℹ️ 表示忽略大小写) 的节点插入匹配 /hk|hk-auto/i 的 outbound 中
// ...
// 可选参数: includeUnsupportedProxy 包含官方/商店版不支持的协议 SSR. 用法: `&includeUnsupportedProxy=true`

// 支持传入订阅 URL. 参数为 url. 记得 url 需要 encodeURIComponent.
// 例如: http://a.com?token=123 应使用 url=http%3A%2F%2Fa.com%3Ftoken%3D123

// ⚠️ 如果 outbounds 为空, 自动创建 COMPATIBLE(direct) 并插入 防止报错

// === xream sing-box template.js (patched with urltest) ===

function main(config) {
  const outbounds = []
  const selectors = []
  const proxyTags = []

  // 收集所有真实代理节点
  for (const p of config.proxies || []) {
    outbounds.push(p)
    proxyTags.push(p.tag)
  }

  // ===== 地区分组 =====
  function makeSelector(tag, filter) {
    const list = proxyTags.filter(name => filter(name))
    if (list.length === 0) return null
    selectors.push({
      type: "selector",
      tag,
      interrupt_exist_connections: true,
      outbounds: list
    })
    return tag
  }

  makeSelector("🇭🇰 香港", n => /HK|Hong/i.test(n))
  makeSelector("🇹🇼 台湾", n => /TW|Taiwan/i.test(n))
  makeSelector("🇸🇬 新加坡", n => /SG|Singapore/i.test(n))
  makeSelector("🇯🇵 日本", n => /JP|Japan/i.test(n))
  makeSelector("🇺🇸 美国", n => /US|United/i.test(n))

  selectors.push({
    type: "selector",
    tag: "其它",
    interrupt_exist_connections: true,
    outbounds: proxyTags
  })

  // ===== 自动选择（urltest）=====
  outbounds.push({
    type: "urltest",
    tag: "🚀 自动选择",
    outbounds: proxyTags,
    url: "https://www.gstatic.com/generate_204",
    interval: "5m",
    tolerance: 50
  })

  // ===== 节点选择 =====
  selectors.push({
    type: "selector",
    tag: "🚀 节点选择",
    interrupt_exist_connections: true,
    outbounds: [
      "🚀 自动选择",
      "🇭🇰 香港",
      "🇹🇼 台湾",
      "🇸🇬 新加坡",
      "🇯🇵 日本",
      "🇺🇸 美国",
      "其它"
    ]
  })

  // ===== 返回给 Sub-Store =====
  return {
    outbounds: [
      ...outbounds,
      ...selectors
    ]
  }
}

