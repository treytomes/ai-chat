import styles from '@/styles/chat.module.scss';
import { Canvg, presets } from 'canvg';
import mermaid from 'mermaid';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

//export const initialize = () => {
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  themeCSS: `
      g.classGroup rect {
        fill: #282a36;
        stroke: #6272a4;
      } 
      g.classGroup text {
        fill: #f8f8f2;
      }
      g.classGroup line {
        stroke: #f8f8f2;
        stroke-width: 0.5;
      }
      .classLabel .box {
        stroke: #21222c;
        stroke-width: 3;
        fill: #21222c;
        opacity: 1;
      }
      .classLabel .label {
        fill: #f1fa8c;
      }
      .relation {
        stroke: #ff79c6;
        stroke-width: 1;
      }
      #compositionStart, #compositionEnd {
        fill: #bd93f9;
        stroke: #bd93f9;
        stroke-width: 1;
      }
      #aggregationEnd, #aggregationStart {
        fill: #21222c;
        stroke: #50fa7b;
        stroke-width: 1;
      }
      #dependencyStart, #dependencyEnd {
        fill: #00bcd4;
        stroke: #00bcd4;
        stroke-width: 1;
      } 
      #extensionStart, #extensionEnd {
        fill: #f8f8f2;
        stroke: #f8f8f2;
        stroke-width: 1;
      }`,
  fontFamily: 'Fira Code',
});
mermaid.run({
  suppressErrors: true,
});

  // mermaid.run();
  //mermaid.contentLoaded();
//};

type MermaidRequiredProps = {
  chart: string,
}

type MermaidOptionalProps = {
  onRenderComplete: (() => void) | undefined,
};

type MermaidProps = MermaidRequiredProps & MermaidOptionalProps;

// const defaultProps: MermaidOptionalProps = {
//   onRenderComplete: undefined,
// }

export const Mermaid = (props: MermaidProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [id, setId] = useState(uuidv4());

   useEffect(() => {
    // mermaidRef.current?.removeAttribute('data-processed');
    // mermaid.contentLoaded();

    const initializeMermaid = async () => {
      if (mermaidRef.current) {
          (mermaidRef.current as any).innerHTML = props.chart;
          const { svg, bindFunctions } = await mermaid.render(`mermaid-diagram-${id}`, props.chart);
          mermaidRef.current.innerHTML = svg;
          bindFunctions?.(mermaidRef.current);

          // TODO: Every time there's an error an error element gets pasted to the bottom of the document...

          // Remove the `mermaid-diagram-${id}` element from the document.
          // const diagramElement = document.getElementById(`mermaid-diagram-${id}`);
          // if (diagramElement) {
          //   diagramElement.remove();
          // }

          if (props.onRenderComplete) props.onRenderComplete();
      }
    };

    initializeMermaid();

    // Clean up mermaid instance when unmounting; doing nothing at the momemt
    return () => {

    };
  }, [props.chart, mermaidRef]);

//   const triggerDownload = (blob: Blob, url: string) => {
//     const objectUrl = URL.createObjectURL(blob);
//     const downloadLink = document.createElement('a');
//     downloadLink.href = objectUrl;
//     downloadLink.download = url;
//     document.body.appendChild(downloadLink);
//     downloadLink.click();

//     setTimeout(() => {
//       URL.revokeObjectURL(downloadLink.href);
//       document.body.removeChild(downloadLink);
//     }, 0);
//   };

//   const PNG_WIDTH = 1920;
//   const PNG_HEIGHT = 1080;
//   const downloadPng = async () => {
//     const preset = presets.offscreen();
//     const svgData = mermaidRef.current?.innerHTML ?? '';
//     const canvas = new OffscreenCanvas(PNG_WIDTH, PNG_HEIGHT);
//     const ctx = canvas.getContext('2d')!;
//     const v = await Canvg.from(ctx, svgData, preset);

//     // Render only first frame, ignoring animations and mouse.
//     await v.render();

//     const blob = await canvas.convertToBlob();

//     triggerDownload(blob, 'mermaid.png');
//   };

//   const downloadSvg = () => {
//     const svgData = mermaidRef.current?.innerHTML ?? '';
//     const svgBlob = new Blob([svgData], {
//       type: 'image/svg+xml;charset=utf-8',
//     });

//     triggerDownload(svgBlob, 'mermaid.svg');
//     // const svgUrl = URL.createObjectURL(svgBlob);
//     // const downloadLink = document.createElement('a');
//     // downloadLink.href = svgUrl;
//     // downloadLink.download = 'mermaid.svg';
//     // document.body.appendChild(downloadLink);
//     // downloadLink.click();

//     // setTimeout(() => {
//     //   URL.revokeObjectURL(downloadLink.href);
//     //   document.body.removeChild(downloadLink);
//     // }, 0);
//   };

  return (
    <div>
      {/* <div className={styles.btn_chabot_message_copy}>
        <Popover
          size="medium"
          position="top"
          triggerType="custom"
          dismissButton={false}
          content={
            <StatusIndicator type="success">Download started.</StatusIndicator>
          }
        >
          <Button
            variant="inline-icon"
            iconName="download"
            ariaLabel="Export PNG"
            onClick={() => {
              // navigator.clipboard.writeText("test");
              downloadPng();
            }}
          />
          <Button
            variant="inline-icon"
            iconName="download"
            ariaLabel="Export SVG"
            onClick={() => {
              // navigator.clipboard.writeText("test");
              downloadSvg();
            }}
          />
        </Popover>
      </div> */}
      <div id={id} ref={mermaidRef}>
        {props.chart}
      </div>
    </div>
  );
};
