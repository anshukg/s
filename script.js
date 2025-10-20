(async function(){
    const d=document.createElement('div');
    d.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999999;background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:30px;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.8);font-family:Arial;text-align:center;min-width:350px';
    d.innerHTML='<div style="font-size:20px;font-weight:bold">📥 Downloading</div><div id="s">Starting...</div><div style="width:100%;height:6px;background:rgba(255,255,255,0.3);border-radius:3px;margin-top:12px"><div id="p" style="width:0%;height:100%;background:#0f0"></div></div><div id="e" style="font-size:11px;margin-top:8px"></div>';
    document.body.appendChild(d);
    
    const s=document.getElementById('s');
    const p=document.getElementById('p');
    const e=document.getElementById('e');
    
    ['abc=0171b7fe7d7ef4d295546bb399f7ccd4','alc=1','adshow=true','abcuser=authenticated','jg_l=11a98374ebec8e0c7a54751d2161804d'].forEach(c=>document.cookie=c+';path=/;max-age=86400');
    ['.paid-col','.login-col','.close-btn','.news_toggle_overlay','.overlay','.notice-container','.news_toggle','.login-overlay'].forEach(sel=>document.querySelectorAll(sel).forEach(el=>el.remove()));
    document.body.style.overflow='auto';
    
    const sc=document.createElement('script');
    sc.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    sc.onload=async()=>{
        s.textContent='Finding images...';
        await new Promise(r=>setTimeout(r,2000));
        
        const imgs=[];
        document.querySelectorAll('img[data-src*="EpaperImages"]').forEach(m=>{
            let src=m.getAttribute('data-src');
            if(src&&src.includes('EpaperImages')){
                const f=src.split('/').pop();
                if(f.includes('-pg')){
                    src=src.replace('ss.png','.png');
                    const pts=src.split('/');
                    let fn=pts[pts.length-1];
                    if(!fn.startsWith('M-')){
                        fn='M-'+fn;
                        pts[pts.length-1]=fn;
                        src=pts.join('/');
                    }
                    imgs.push(src);
                }
            }
        });
        
        imgs.sort((a,b)=>parseInt(a.match(/pg(\d+)/)?.[1]||0)-parseInt(b.match(/pg(\d+)/)?.[1]||0));
        
        if(!imgs.length){
            s.textContent='❌ No pages';
            d.style.background='red';
            return;
        }
        
        s.textContent='Found '+imgs.length+' pages';
        await new Promise(r=>setTimeout(r,1000));
        
        const load=url=>new Promise((v,j)=>{
            const i=new Image();
            i.crossOrigin='anonymous';
            i.onload=()=>v(i);
            i.onerror=j;
            i.src=url;
        });
        
        const proc=img=>new Promise(v=>{
            const c=document.createElement('canvas');
            c.width=img.naturalWidth;
            c.height=img.naturalHeight;
            const x=c.getContext('2d',{alpha:false});
            x.imageSmoothingEnabled=false;
            x.fillStyle='#FFF';
            x.fillRect(0,0,c.width,c.height);
            x.drawImage(img,0,0);
            v({dataUrl:c.toDataURL('image/png',1),width:c.width,height:c.height});
        });
        
        const first=await load(imgs[0]);
        const fp=await proc(first);
        const w=(fp.width/96)*25.4;
        const h=(fp.height/96)*25.4;
        const pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:[w,h],compress:true});
        
        let added=0;
        const t0=Date.now();
        
        for(let i=0;i<imgs.length;i++){
            s.textContent='Processing '+(i+1)+'/'+imgs.length;
            p.style.width=Math.round((i+1)/imgs.length*100)+'%';
            
            if(i>0){
                const eta=(imgs.length-i)*((Date.now()-t0)/1000/i);
                e.textContent='ETA: '+Math.floor(eta/60)+'m '+Math.floor(eta%60)+'s';
            }
            
            try{
                const img=await load(imgs[i]);
                const pr=await proc(img);
                if(added>0) pdf.addPage([w,h],'portrait');
                pdf.addImage(pr.dataUrl,'PNG',0,0,w,h,undefined,'FAST');
                added++;
                await new Promise(r=>setTimeout(r,100));
            }catch(err){}
        }
        
        s.textContent='Saving...';
        p.style.width='100%';
        
        const name=document.title.replace(/[^a-z0-9\s]/gi,'_').substring(0,30)+'_'+new Date().toISOString().split('T')[0]+'.pdf';
        pdf.save(name);
        
        s.textContent='✅ Done! '+added+' pages';
        d.style.background='green';
    };
    
    document.head.appendChild(sc);
})();
