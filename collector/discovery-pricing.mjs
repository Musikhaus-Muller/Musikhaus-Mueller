import { parsePrice } from '../worker/handler.mjs';

export function createCandidatePriceResolver(fetcher=fetch, parser=parsePrice) {
  const cache=new Map();

  return async function resolveCandidatePrice(candidate) {
    if (Number.isFinite(Number(candidate?.price)) && Number(candidate.price) > 0) {
      return { ...candidate, price:Number(candidate.price), priceSource:'catalog' };
    }

    const url=String(candidate?.url || '');
    if (!url) return { ...candidate, price:null, priceSource:null, priceError:'missing_url' };
    if (cache.has(url)) return { ...candidate, ...await cache.get(url) };

    const task=(async()=>{
      try{
        const target=new URL(url);
        if(target.hostname!=='www.prolighting.de') throw new Error('unsupported_host');

        const res=await fetcher(url,{
          redirect:'follow',
          signal:AbortSignal.timeout(15000),
          headers:{
            Accept:'text/html,application/xhtml+xml',
            'Accept-Language':'de-DE,de;q=0.9,en;q=0.6',
            'User-Agent':'Mozilla/5.0 (compatible; PA-Bundle-Discovery/2.1; +price-resolver)'
          }
        });
        if(!res.ok) throw new Error('HTTP '+res.status);

        const html=await res.text();
        const parsed=parser(html,candidate.name || '',target.hostname);
        const price=Number(parsed.price);
        if(!Number.isFinite(price) || price<=0) throw new Error('invalid_price');

        return {price:Math.round(price*100)/100,priceSource:'product-page',priceError:null};
      }catch(e){
        return {price:null,priceSource:null,priceError:String(e?.message||e)};
      }
    })();

    cache.set(url,task);
    return { ...candidate, ...await task };
  };
}

export function comparableRecipeTotal(components, signal) {
  if(!['exact_recipe_match','similar_recipe_match'].includes(signal)) return null;
  let total=0;
  for(const component of components||[]){
    const price=Number(component?.top1?.price);
    const quantity=Number(component?.quantity||1);
    if(!Number.isFinite(price) || price<=0 || !Number.isFinite(quantity) || quantity<=0) return null;
    total+=price*quantity;
  }
  return Math.round(total*100)/100;
}
