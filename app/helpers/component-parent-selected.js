import Helper from '@ember/component/helper';

const getParentIds = function(item, arr = []) {
  if (!item.parent || !item.parent.id) {
    return arr;
  }

  arr.push(item.parent.id);
  return getParentIds(item.parent, arr);
};

export default Helper.extend({
  compute(params) {
    const [item, selectedID] = params;

    if (!selectedID) {
      return false;
    }

    return !!getParentIds(item).find(function(parentID) {
      return parentID === selectedID;
    });
  }
});
