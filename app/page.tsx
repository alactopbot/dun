const rooms = [
  { icon: "◒", title: "大地展厅", subtitle: "LAND", text: "从三角龙和剑龙开始，观察角、背板与身体形状。", links: [["三角龙", "/exhibits/triceratops"], ["剑龙", "/exhibits/stegosaurus"]] },
  { icon: "≈", title: "远古海洋", subtitle: "OCEAN", text: "潜入蓝色深处，认识曾经生活在海里的巨兽。", links: undefined },
  { icon: "⌁", title: "天空之上", subtitle: "SKY", text: "抬头看看，翼龙怎样借助风飞过史前世界。", links: undefined },
];

const promises = [
  ["01", "一起观察", "不急着给答案，先和孩子说出你们看到了什么。"],
  ["02", "轻轻聆听", "没有自动播放，由孩子决定什么时候听一小段故事。"],
  ["03", "带着问题离开", "每次参观只留一个问题，让好奇心延续到屏幕之外。"],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="DUN 首页"><span className="brand-mark">D</span><span>DUN</span></a>
        <nav aria-label="主要导航"><a href="#museum">探索展厅</a><a href="#parents">亲子指南</a><a href="#open-source">开放计划</a></nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">A QUIET PREHISTORIC MUSEUM</p>
          <h1>慢慢看，<br />慢慢问。</h1>
          <p className="hero-lead">一座为 2–6 岁孩子和大人共同设计的史前动物博物馆。没有输赢，没有催促，只有一次安静的共同发现。</p>
          <a className="primary-button" href="#museum">走进博物馆 <span aria-hidden="true">→</span></a>
        </div>

        <div className="specimen" aria-label="三角龙化石插画">
          <div className="sun" />
          <div className="dino" aria-hidden="true">
            <div className="dino-tail" /><div className="dino-body" />
            <div className="dino-leg leg-one" /><div className="dino-leg leg-two" />
            <div className="dino-frill" /><div className="dino-head" />
            <div className="dino-horn horn-one" /><div className="dino-horn horn-two" /><div className="dino-eye" />
          </div>
          <div className="ground-line" />
          <div className="specimen-label"><span>今日相遇</span><strong>三角龙</strong><small>TRICERATOPS · 晚白垩世</small></div>
        </div>
      </section>

      <section className="rooms section" id="museum">
        <div className="section-heading"><p className="eyebrow">THREE ROOMS, ENDLESS QUESTIONS</p><h2>从哪里开始探索？</h2></div>
        <div className="room-grid">
          {rooms.map((room) => <article className="room-card" key={room.title}><div className="room-icon" aria-hidden="true">{room.icon}</div><p>{room.subtitle}</p><h3>{room.title}</h3><span>{room.text}</span>{room.links ? <div className="exhibit-links">{room.links.map(([name, href]) => <a className="coming" href={href} key={href}>参观{name}展品 →</a>)}</div> : <span className="coming">逐步开放</span>}</article>)}
        </div>
      </section>

      <section className="parent-section section" id="parents">
        <div className="parent-intro"><p className="eyebrow">FOR CHILDREN, WITH GROWN-UPS</p><h2>参观不是考试，<br />好奇没有标准答案。</h2><p>DUN 希望屏幕成为亲子对话的一扇小窗，而不是把大人和孩子分开的另一块屏幕。</p></div>
        <ol className="promise-list">
          {promises.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
        </ol>
      </section>

      <section className="open-source section" id="open-source">
        <p className="eyebrow">OPEN, CALM, ITERATIVE</p><h2>这座博物馆正在生长。</h2>
        <p>我们会把每一个小展品都作为公开 Issue 来设计、实现和验证，让人和 AI 代理围绕同一份证据持续协作。</p>
        <div className="status"><i /> Slice 0 · 博物馆入口已搭建</div>
      </section>

      <footer><div className="brand"><span className="brand-mark">D</span><span>DUN</span></div><p>给孩子一段安静的史前时光。</p><small>Open-source project · Built with care</small></footer>
    </main>
  );
}
