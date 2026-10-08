// Only actual overlays block the world; normal panel buttons remain usable.
export function gameModalOpen(){return !!document.querySelector('dialog[open], .capital-research-overlay:not([hidden]), #inspectionCard:not([hidden])');}
export function resetGamePointers(){document.dispatchEvent(new Event('game-input-reset'));}
