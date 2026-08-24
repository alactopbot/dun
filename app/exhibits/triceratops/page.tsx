import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { triceratopsExhibit } from "../../../content/exhibits/triceratops";

export const metadata: Metadata = {
  title: "三角龙展品 · DUN",
  description: "一页正在共同准备的三角龙亲子观察展品。",
};

export default function TriceratopsPage() {
  const exhibit = triceratopsExhibit;
  const media = exhibit.media[0];
  return (
    <main id="content">
      <a href="#exhibit">跳到展品内容</a>
      <header>
        <Link href="/">← 返回博物馆</Link>
      </header>

      <article id="exhibit">
        <header>
          <p>今日展品</p>
          <h1>{exhibit.name.zh}</h1>
          <p lang="en">{exhibit.scientificName}</p>
        </header>

        <figure data-exhibit-figure>
          <Image src={media.path} width={media.width} height={media.height} alt={media.alt.zh} unoptimized />
          <figcaption>复原想象 <span lang="en">artist’s reconstruction</span></figcaption>
        </figure>

        <section aria-labelledby="observe-heading">
          <h2 id="observe-heading">先一起观察</h2>
          <p>{exhibit.introduction.zh}</p>
          <p lang="en">{exhibit.introduction.en}</p>
          <ol>
            {exhibit.prompts.map(({ id, prompt }) => (
              <li data-observation-prompt key={id}>
                <p>{prompt.zh}</p>
                <p lang="en">{prompt.en}</p>
              </li>
            ))}
          </ol>
          <aside><p>{exhibit.prompts[0].adultNote?.zh}</p><p lang="en">{exhibit.prompts[0].adultNote?.en}</p></aside>
        </section>

        <section aria-labelledby="facts-heading">
          <h2 id="facts-heading">慢慢打开事实卡片</h2>
          {exhibit.facts.map((fact, index) => (
            <details data-fact-id={fact.id} key={fact.id}>
              <summary>看看第 {index + 1} 张事实卡片</summary>
              <p>{fact.text.zh}</p><p lang="en">{fact.text.en}</p>
              <p>{fact.sourceIds.map((id) => {
                const source = exhibit.sources.find((item) => item.id === id);
                return source ? <a data-source-link href={source.url} target="_blank" rel="noreferrer" key={id}>{source.publisher}</a> : null;
              })}</p>
            </details>
          ))}
        </section>

        <details data-source-credit>
          <summary>来源与创作说明</summary>
          <ul>{exhibit.sources.map((source) => <li key={source.id}>
            <cite>{source.title}</cite> · {source.publisher}<br />定位：{source.locator}<br />查阅日期：{source.accessedOn}<br />{source.supports}<br />
            <a data-source-link href={source.url} target="_blank" rel="noreferrer">查看机构原页</a>
          </li>)}</ul>
          <p>图像：{media.creator} · CC BY-SA 4.0</p>
        </details>

        <section data-closing-section aria-labelledby="closing-heading">
          <h2 id="closing-heading">今天先看到这里</h2>
          <p>{exhibit.closingPrompt.prompt.zh}</p>
          <p lang="en">{exhibit.closingPrompt.prompt.en}</p>
          <Link href="/">← 返回博物馆</Link>
        </section>
      </article>
    </main>
  );
}
