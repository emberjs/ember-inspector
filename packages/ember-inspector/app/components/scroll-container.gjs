<div
  class="scroll-target"
  style={{this.scrollTargetStyle}}
  role="presentation"
  {{did-insert this.elementInserted}}
  {{did-update this.scrollPreviewIntoViewIfNeeded this.previewing}}
  {{did-update this.scrollIntoViewIfNeeded this.currentItem}}
></div>
{{yield}}