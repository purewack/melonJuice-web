import {useRef, Children, cloneElement}from 'react'

const PointerHandle = ({ disable, onStart, onEnd, onChange, shouldSnapToFirstDirection, bounds, children }) => {
    const prevStats = useRef();
  
    const getPointer = (e, touch) => {
      return touch ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY];
    };
  
    const pointermove = (e, touch) => {
      e.preventDefault();
      e.stopPropagation();
      const [x,y] = getPointer(e, touch);


      prevStats.current.prev_dx = prevStats.current.dx
      prevStats.current.prev_dy = prevStats.current.dy

      let dx = x - prevStats.current.px; 
      // console.log(dx)
      // console.log(bounds)
      if(bounds?.maxDX !== null && dx >= bounds?.maxDX) dx = bounds.maxDX
      else if(bounds?.minDX !== null && dx <= bounds?.minDX) dx = bounds.minDX
      prevStats.current.dx = dx
      // console.log(dx)
      // console.log('---')
      //const tx = prevStats.current.ix + prevStats.current.dx;

      let dy = y - prevStats.current.py;
      if(bounds?.maxDY !== null && dy >= bounds?.maxDY) dy = bounds.maxDY
      else if(bounds?.minDY != null && dy <= bounds?.minDY) dy = bounds.minDY
      prevStats.current.dy = dy
      //const ty = prevStats.current.iy + prevStats.current.dy;

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
          onChange && onChange({
            dx: prevStats.current.passedStartMargin === 'x' ? prevStats.current.dx : 0,
            dy: prevStats.current.passedStartMargin === 'y' ? prevStats.current.dy : 0,
            prev_dx: prevStats.current.prev_dx,
            prev_dy: prevStats.current.prev_dy,
          })
        return
      }

      //if (tx >= 0)
      onChange && onChange({
        dx: (prevStats.current.dx),
        dy: (prevStats.current.dy),
        prev_dx: prevStats.current.prev_dx,
        prev_dy: prevStats.current.prev_dy,
      });
    };
    
    const touchmove = (e)=>{pointermove(e,true)}
    const touchend = (e)=>{pointerup(e,true)}

    const pointerdown = (e, touch) => {
      e.preventDefault();
      e.stopPropagation();
      const [x,y] = getPointer(e, touch);
      const targetBox = e.target.getBoundingClientRect();

      prevStats.current = {
        targetBox,
        ix: targetBox.left - e.target.offsetLeft,
        px: x,
        dx: 0,
        prev_dx:0,
        iy: targetBox.top - e.target.offsetTop,
        py: y,
        dy: 0,
        prev_dy:0,
        passedStartMargin: null,
      };

      onStart && onStart({...prevStats.current})

      if(touch){  
        document.addEventListener('touchmove', touchmove, { passive: false });
        document.addEventListener('touchend', touchend, { passive: false });
      }
      else{
        window.addEventListener("mousemove", pointermove);
        window.addEventListener("mouseup", pointerup);
      }
    };
  
    const pointerup = (e, touch) => {
      e.preventDefault();
      e.stopPropagation();
      
      if(touch){  
        document.removeEventListener('touchmove', touchmove, { passive: false });
        document.removeEventListener('touchend', touchend, { passive: false });
      }
      else{
        window.removeEventListener("mousemove", pointermove);
        window.removeEventListener("mouseup", pointerup);
      }
      
      if(shouldSnapToFirstDirection ){
        onEnd && onEnd({
          dx: prevStats.current.passedStartMargin === 'x' ? prevStats.current.dx : 0,
          dy: prevStats.current.passedStartMargin === 'y' ? prevStats.current.dy : 0,
          prev_dx: prevStats.current.prev_dx,
          prev_dy: prevStats.current.prev_dy,
        })
        return
      }

      onEnd && onEnd({
        dx: (prevStats.current.dx),
        dy: (prevStats.current.dy),
        prev_dx: prevStats.current.prev_dx,
        prev_dy: prevStats.current.prev_dy,
      });
    };
  
    return (<>
      {!disable ?
        Children.only(
        cloneElement(children, {
          onMouseDown: pointerdown,
          onTouchStart: (e)=>{pointerdown(e,'touch')}
        }))
        :
        children  
      }
    </>)
  };

export default PointerHandle;