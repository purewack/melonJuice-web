import {useRef, useState, Children, cloneElement}from 'react'

const PointerHandle = ({ snap, onStart, onEnd, onChange, children }) => {
    const prevStats = useRef();
    const [holding, setHolding] = useState(false);
  
    const getPointer = (e, type) => {
      return type === "touches" ? e.touches[0].clientX : e.clientX;
    };
  
    const calcSnap = (x) => {
      if (snap.grain) {
        let b = snap.size / snap.grain;
        let l = Math.floor(x / b) * b;
        return l;
      }
      return x;
    };
  
    const pointermove = (e, type) => {
      e.preventDefault();
      e.stopPropagation();
      const x = getPointer(e, type);
      prevStats.current.dx = x - prevStats.current.px;
      const tx = prevStats.current.ix + prevStats.current.dx;
      //if (tx >= 0)
      onChange({
        dxx: calcSnap(prevStats.current.dx)
      });
    };
  
    const pointerdown = (e, type) => {
      e.preventDefault();
      e.stopPropagation();
      setHolding(true);
      const x = getPointer(e, type);
      const targetBox = e.target.getBoundingClientRect();
      prevStats.current = {
        targetBox,
        ix: targetBox.left - e.target.offsetLeft,
        px: x,
        dx: 0
      };
      onStart({...prevStats.current})
      window.addEventListener("mousemove", pointermove);
      window.addEventListener("mouseup", pointerup);
    };
  
    const pointerup = (e, type) => {
      e.preventDefault();
      e.stopPropagation();
      setHolding(false);
      onEnd({
        dxx: prevStats.current.dx
      });
      window.removeEventListener("mousemove", pointermove);
      window.removeEventListener("mouseup", pointerup);
    };
  
    return Children.only(
      cloneElement(children, {
        onMouseDown: pointerdown
      })
    );
  };
  export default PointerHandle;