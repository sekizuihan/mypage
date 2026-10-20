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

  // ── 作品ページ（works/<フォルダ名>/ と work.html?slug=...）

  // "/img/a.png" のようなサイトのルートからのパスを、表示するページから見た相対パスにする
  // （例: base が "../../" なら "../../img/a.png"）。サブパスで公開されていても画像が切れないようにするため。
  function siteURL(u, base) {
    return base != null && /^\/(?!\/)/.test(u || '') ? base + u.slice(1) : u;
  }

  // 通常の YouTube URL（watch?v= / youtu.be / shorts）を埋め込み用 URL にする。embed URL はそのまま。
  function youtubeEmbedURL(url) {
    url = String(url || '').trim();
    if (/youtube(-nocookie)?\.com\/embed\//.test(url)) return url;
    var m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
    return m ? 'https://www.youtube.com/embed/' + m[1] : url;
  }

  // About 本文：改行はそのまま改行、「[表示名](URL)」はリンクになる
  function descriptionHTML(text) {
    return esc(text)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2"><font color="#a9a9a9">$1</font></a>')
      .replace(/\n/g, '<br>');
  }

  function workHTML(d, opts) {
    var base = opts && opts.base;
    function imageSection(cls, img) {
      return '<section><ul class="' + cls + '"><li><a href="">' +
        '<img src="' + esc(siteURL(img.src, base)) + '" alt="' + esc(img.alt) + '">' +
        '</a></li></ul></section>';
    }

    var html = '<section><h2>' + esc(d.title) + '</h2><h4>' + esc(d.year) + '</h4></section>';

    (d.main_images || []).forEach(function (img) { html += imageSection('main_img', img); });
    (d.sub_images || []).forEach(function (img) { html += imageSection('sub_img', img); });

    (d.youtube || []).forEach(function (y) {
      html += '<section><iframe width="100%" height="460" src="' + esc(youtubeEmbedURL(y.url)) + '"' +
        ' title="YouTube video player" frameborder="0"' +
        ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"' +
        ' referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></section>';
    });

    if (d.videos && d.videos.length) {
      html += '<section>' + d.videos.map(function (v) {
        return '<video width="100%" controls style="max-width: 100%; height: auto; display: block;">' +
          '<source src="' + esc(siteURL(v.src, base)) + '" type="video/mp4">' +
          'お使いのブラウザは動画タグに対応していません。</video>';
      }).join('<br>') + '</section>';
    }

    if (d.gallery_images && d.gallery_images.length) {
      var cls = d.gallery_style === 'cs_an' ? 'cs_an' : 'cs';
      html += '<section><ul class="' + cls + '">' + d.gallery_images.map(function (img) {
        return '<li><a href=""><img src="' + esc(siteURL(img.src, base)) + '" alt="' + esc(img.alt) + '"></a></li>';
      }).join('') + '</ul></section>';
    }

    if (d.description) {
      html += '<section><h3>About</h3><div class="text"><p>' + descriptionHTML(d.description) + '</p></div></section>';
    }

    return html;
  }

  global.PortfolioRender = {
    worksGridHTML: worksGridHTML,
    otherWorksHTML: otherWorksHTML,
    aboutHTML: aboutHTML,
    workHTML: workHTML
  };
})(window);
