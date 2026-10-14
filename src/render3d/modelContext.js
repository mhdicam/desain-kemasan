// Resolve all previews from the selected model, never a previous template.
export function modelStateForPreview(state,modelId){
  if(!modelId) throw Error('Missing modelId');
  if(state.activeModelId && state.activeModelId!==modelId)throw Error('Model ID mismatch: selected '+state.activeModelId+' vs '+modelId);
  return state.tpl===modelId?state:{...state,tpl:modelId,ovr:{},typeOvr:{}};
}
