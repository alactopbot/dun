import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { triceratopsExhibit } from "../../../content/exhibits/triceratops";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "三角龙展品 · DUN",
  description: "一页正在共同准备的三角龙亲子观察展品。",
};

export default function TriceratopsPage() {
  const exhibit = triceratopsExhibit;
  const media = exhibit.media[0];
  return (
    <main className={styles.page} id="content">
      <a className={styles.skipLink} href="#exhibit">跳到展品内容</a>
      <header className={styles.topbar}>
        <Link className={styles.returnLink} href="/">← 返回博物馆</Link>
      </header>

      <article className={styles.exhibit} id="exhibit">
        <header className={styles.hero}>
          <p className={styles.eyebrow}>今日展品</p>
          <h1 className={styles.title}>{exhibit.name.zh}</h1>
          <p className={styles.scientificName} lang="en">{exhibit.scientificName}</p>
        </header>

        <figure className={styles.figure} data-exhibit-figure>
          <Image className={styles.image} src={media.path} width={media.width} height={media.height} alt={media.alt.zh} unoptimized />
          <figcaption className={styles.caption}>复原想象 <span lang="en">artist’s reconstruction</span></figcaption>
        </figure>

        <section className={styles.section} aria-labelledby="observe-heading">
          <h2 className={styles.heading} id="observe-heading">先一起观察</h2>
          <p className={styles.lead}>{exhibit.introduction.zh}</p>
          <p lang="en">{exhibit.introduction.en}</p>
          <ol className={styles.promptGrid}>
            {exhibit.prompts.map(({ id, prompt }) => (
              <li className={styles.promptCard} data-observation-prompt key={id}>
                <p>{prompt.zh}</p>
                <p lang="en">{prompt.en}</p>
              </li>
            ))}
          </ol>
          <aside className={styles.adultNote}><p>{exhibit.prompts[0].adultNote?.zh}</p><p lang="en">{exhibit.prompts[0].adultNote?.en}</p></aside>
        </section>

        <section className={styles.section} aria-labelledby="facts-heading">
          <h2 className={styles.heading} id="facts-heading">慢慢打开事实卡片</h2>
          {exhibit.facts.map((fact, index) => (
            <details className={styles.factCard} data-fact-id={fact.id} key={fact.id}>
              <summary>看看第 {index + 1} 张事实卡片</summary>
              <p>{fact.text.zh}</p><p lang="en">{fact.text.en}</p>
              <p className={styles.factSources}>{fact.sourceIds.map((id, index) => {
                const source = exhibit.sources.find((item) => item.id === id);
                return source ? <span key={id}>{index > 0 ? " · " : null}<a data-source-link data-source-id={id} href={source.url} target="_blank" rel="noreferrer" lang="en">{source.publisher}</a></span> : null;
              })}</p>
            </details>
          ))}
        </section>

        <details className={styles.sourcePanel} data-source-credit>
          <summary>来源与创作说明</summary>
          <ul className={styles.sourceList}>{exhibit.sources.map((source) => <li key={source.id}>
            <cite lang="en">{source.title}</cite> · <span lang="en">{source.publisher}</span><br />定位：<span lang="en">{source.locator}</span><br />查阅日期：{source.accessedOn}<br />{source.supports}<br />
            <a data-source-link href={source.url} target="_blank" rel="noreferrer">查看机构原页</a>
          </li>)}</ul>
          <p>图像：{media.creator} · CC BY-SA 4.0</p>
        </details>

        <section className={styles.closing} data-closing-section aria-labelledby="closing-heading">
          <h2 className={styles.heading} id="closing-heading">今天先看到这里</h2>
          <p>{exhibit.closingPrompt.prompt.zh}</p>
          <p lang="en">{exhibit.closingPrompt.prompt.en}</p>
          <Link className={styles.returnLink} href="/">← 返回博物馆</Link>
        </section>
      </article>
    </main>
  );
}
