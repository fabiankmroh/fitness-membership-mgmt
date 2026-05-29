"use client";

import { useEffect, useRef, useState } from "react";

export default function SignaturePad({ initialSignatureData = "" }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [signatureData, setSignatureData] = useState(initialSignatureData);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    function prepareCanvas() {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const context = canvas.getContext("2d");

      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 3;
      context.strokeStyle = "#17211b";

      if (signatureData) {
        const image = new Image();
        image.onload = () => {
          context.drawImage(image, 0, 0, rect.width, rect.height);
        };
        image.src = signatureData;
      }
    }

    prepareCanvas();
    window.addEventListener("resize", prepareCanvas);

    return () => {
      window.removeEventListener("resize", prepareCanvas);
    };
  }, [signatureData]);

  function getPoint(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  function startDrawing(event) {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getPoint(event);

    isDrawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event) {
    if (!isDrawingRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getPoint(event);

    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing(event) {
    const canvas = canvasRef.current;

    if (!isDrawingRef.current) {
      return;
    }

    isDrawingRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    setSignatureData(canvas.toDataURL("image/png"));
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    context.clearRect(0, 0, rect.width, rect.height);
    setSignatureData("");
  }

  return (
    <div className="signatureField">
      <div className="signatureHeader">
        <span>회원 서명</span>
        <button className="secondaryButton" onClick={clearSignature} type="button">
          서명 지우기
        </button>
      </div>

      <canvas
        aria-label="회원 서명 입력란"
        className="signatureCanvas"
        onPointerCancel={stopDrawing}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        ref={canvasRef}
      />

      <input name="signatureData" readOnly type="hidden" value={signatureData} />
    </div>
  );
}
