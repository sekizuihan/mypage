// content/*.json から各ページの HTML を組み立てる。
// サイト本体（index.html / works/About/index.html）と admin のプレビューで共通で使う。
(function (global) {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function linkHTML(href, label) {
    return '<a href="' + esc(href) + '"><font color="#a9a9a9"><u>' + esc(label || 'Link') + '</u></font></a>';
  }

  // 「日付　内容　リンク」の1行
  function itemHTML(item) {
    var text = esc(item.date) + '　' + esc(item.text);
    if (item.link) text += '　' + linkHTML(item.link, item.linkLabel);
    return text;
  }

  // ── トップページ：作品グリッド
  // opts.resolve: 画像パスを変換する関数（admin プレビュー用）
  function worksGridHTML(data, opts) {
    var resolve = (opts && opts.resolve) || function (u) { return u; };
    return (data.works || []).map(function (w) {
      return '<li><a href="' + esc(w.url) + '">' +
        '<img src="' + esc(resolve(w.image)) + '" alt="' + esc(w.alt) + '">' +
        '<div class="text">' +
        '<p class="name">' + (w.name || '') + '</p>' + // 作品名は <br> を使うため HTML のまま
        '<p>' + esc(w.tools) + '</p>' +
        '</div>' +
        '</a></li>';
    }).join('');
  }

  // ── トップページ：Other works
  function otherWorksHTML(data) {
    return (data.items || []).map(function (item) {
      return itemHTML({ date: item.date, text: item.title, link: item.link, linkLabel: item.linkLabel }) + '<br><br>';
    }).join('');
  }

  // ── About ページ（名前 / About / 各セクション）
  function aboutHTML(data) {
    var html = '<section><h3>' + esc(data.name) + '</h3></section>';

    if (data.bio) {
      var paras = String(data.bio).split(/\n\s*\n/).map(function (p) {
        return esc(p.trim()).replace(/\n/g, '<br>');
      });
      html += '<section><h3>About</h3><div class="text"><p>' + paras.join('<br><br>') + '</p></div></section>';
    }

    (data.sections || []).forEach(function (sec) {
      var items = (sec.items || []).map(itemHTML);
      html += '<section><h3>' + esc(sec.title) + '</h3><div class="text"><p>' +
        items.join('<br><br>') + '<br>' +
        '</p></div></section>';
    });

    return html;
  }

  global.PortfolioRender = {
    worksGridHTML: worksGridHTML,
    otherWorksHTML: otherWorksHTML,
    aboutHTML: aboutHTML
  };
})(window);
