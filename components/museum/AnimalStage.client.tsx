"use client";

import { useEffect, useRef, useState } from "react";
import type { Presentation } from "../../lib/exhibits/schema";
import styles from "./AnimalStage.module.css";

type Props = Readonly<{
  name: string; alt: string; modelUrl: string; backgroundLandscape: string; backgroundPortrait: string;
  posterLandscape: string; posterPortrait: string; presentation: Presentation;
}>;

export function AnimalStageClient(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<import("../../lib/viewer/ViewerController").ViewerController | undefined>(undefined);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    import("../../lib/viewer/ViewerController").then(({ ViewerController }) => {
      if (!active || !host.current) return;
      try {
        controller.current = new ViewerController(host.current, {
          modelUrl: props.modelUrl, presentation: props.presentation,
          onReady: () => active && setState("ready"), onError: () => active && setState("error"),
        });
      } catch { setState("error"); }
    }).catch(() => active && setState("error"));
    return () => { active = false; controller.current?.dispose(); controller.current = undefined; };
  }, [attempt, props.modelUrl, props.presentation]);

  return <figure className={styles.stage} data-animal-stage data-exhibit-figure data-state={state}>
    <picture className={styles.background}>
      <source media="(max-width: 640px)" srcSet={props.backgroundPortrait} />
      <img src={props.backgroundLandscape} alt="" width="1280" height="720" />
    </picture>
    <picture className={styles.poster}>
      <source media="(max-width: 640px)" srcSet={props.posterPortrait} />
      <img src={props.posterLandscape} alt={props.alt} width="1280" height="720" />
    </picture>
    <div className={styles.canvasHost} ref={host} aria-hidden="true" />
    <figcaption className={styles.caption}>复原想象 <span lang="en">artist’s reconstruction</span> · {props.name}</figcaption>
    <p className={styles.status} role="status" aria-live="polite">
      {state === "loading" ? "正在准备可操作模型，静态展品仍可观察。" : state === "error" ? "这次模型没有来到展台，可以先看静态展品。" : "模型已准备好。"}
    </p>
    <div className={styles.controls} data-model-controls aria-label={`${props.name}模型观察控制`}>
      <button type="button" onClick={() => controller.current?.rotate(-1)} disabled={state !== "ready"}>左转</button>
      <button type="button" onClick={() => controller.current?.rotate(1)} disabled={state !== "ready"}>右转</button>
      <button type="button" onClick={() => controller.current?.zoom(0.12)} disabled={state !== "ready"}>放大</button>
      <button type="button" onClick={() => controller.current?.zoom(-0.14)} disabled={state !== "ready"}>缩小</button>
      <button type="button" onClick={() => controller.current?.reset()} disabled={state !== "ready"}>恢复初始视角</button>
      {state === "error" ? <button type="button" onClick={() => { setState("loading"); setAttempt((value) => value + 1); }}>重试一次</button> : null}
    </div>
  </figure>;
}
