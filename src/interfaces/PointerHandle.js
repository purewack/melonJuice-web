import {useRef, useState, Children, cloneElement}from 'react'

const PointerHandle = ({ onStart, onEnd, onChange, shouldSnapToFirstDirection, children }) => {
    const prevStats = useRef();
  
    const getPointer = (e, type) => {
      return type === "touches" ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY];
    };
  
    const pointermove = (e, type) => {
      e.preventDefault();
      e.stopPropagation();
      const [x,y] = getPointer(e, type);

      prevStats.current.dx = x - prevStats.current.px;
      const tx = prevStats.current.ix + prevStats.current.dx;

      prevStats.current.dy = y - prevStats.current.py;
      const ty = prevStats.current.iy + prevStats.current.dy;

      if(shouldSnapToFirstDirection ){
        if(!prevStats.current.passedStartMargin){
          const passMargin = 10
          if(Math.abs(prevStats.current.dx) > passMargin){
            prevStats.current.passedStartMargin = 'x'
          }
          else if(Math.abs(prevStats.current.dy) > passMargin){
            prevStats.current.passedStartMargin = 'y'
          }
        }
        else 
          onChange({
            dxx: prevStats.current.passedStartMargin === 'x' ? prevStats.current.dx : 0,
            dyy: prevStats.current.passedStartMargin === 'y' ? prevStats.current.dy : 0,
          })
        return
      }

      //if (tx >= 0)
      onChange({
        dxx: (prevStats.current.dx),
        dyy: (prevStats.current.dy)
      });
    };
  
    const pointerdown = (e, type) => {
      e.preventDefault();
      e.stopPropagation();
      const [x,y] = getPointer(e, type);
      const targetBox = e.target.getBoundingClientRect();

      prevStats.current = {
        targetBox,
        ix: targetBox.left - e.target.offsetLeft,
        px: x,
        dx: 0,
        iy: targetBox.top - e.target.offsetTop,
        py: y,
        dy: 0,
        passedStartMargin: null,
      };

      //onStart({...prevStats.current})
      window.addEventListener("mousemove", pointermove);
      window.addEventListener("mouseup", pointerup);
    };
  
    const pointerup = (e, type) => {
      e.preventDefault();
      e.stopPropagation();
      
      window.removeEventListener("mousemove", pointermove);
      window.removeEventListener("mouseup", pointerup);
      
      if(shouldSnapToFirstDirection ){
        onEnd({
          dxx: prevStats.current.passedStartMargin === 'x' ? prevStats.current.dx : 0,
          dyy: prevStats.current.passedStartMargin === 'y' ? prevStats.current.dy : 0,
        })
        return
      }

      onEnd({
        dxx: (prevStats.current.dx),
        dyy: (prevStats.current.dy) 
      });
    };
  
    return Children.only(
      cloneElement(children, {
        onMouseDown: pointerdown
      })
    );
  };

export default PointerHandle;