import ProfileNode from 'models/profile_node';

module("ProfileNode");

test("It can create a ProfileNode", function() {
  var p = new ProfileNode(1001, {template: 'application'});

  ok(!!p, "it creates a ProfileNode");
  equal(p.start, 1001, "it stores the start time");
  equal(p.name, "application", "it extracted the correct name");
  equal(p.children.length, 0, "it has no children by default");
  ok(!p.time, "It has no time because it's unfinished");
});

test("with no payload it has an unknown name", function() {
  var p = new ProfileNode(1234);
  equal(p.name, "Unknown view");
});

test("It can extract the name from an object payload", function() {
  var p = new ProfileNode(1000, {object: {
    toString: function() { return "custom toString()"; }
  }});

  equal(p.name, "custom toString()", "it called toString()");
});

test("It can create a child ProfileNode", function() {
  var p1 = new ProfileNode(new Date().getTime(), {template: 'items'}),
      p2 = new ProfileNode(new Date().getTime(), {template: 'item'}, p1);

  ok(!p1.parent, "Without a parent parameter, the attribute is not set");
  equal(p2.parent, p1, "If passed, p2's parent is assigned to p1");
  ok(!p1.time, "p1 has no time because it's unfinished");
  ok(!p2.time, "p2 has no time because it's unfinished");
});

test("It can finish the timer", function() {
  var p = new ProfileNode(1000, {template: 'users'});
  p.finish(1004);
  equal(p.time, 4, "it took 4 ms");
});

test("When a node has children, they are inserted when finished", function() {
  var p1 = new ProfileNode(1000, {template: 'candies'}),
      p2 = new ProfileNode(1001, {template: 'candy'}, p1);

  equal(p1.children.length, 0, "has no children at first");
  p2.finish(2022);
  equal(p1.children[0], p2, "has a child after p2 finishes");
});

test("Can be serialized as JSON", function() {
  var p1 = new ProfileNode(1000, {template: 'donuts'}),
      p2 = new ProfileNode(1001, {template: 'donut'}, p1);

  p2.finish(1003);
  p1.finish(1004);

  ok(JSON.stringify(p1), "it can serialize due to no cycles in the object");
});

test("Name takes the following priority: display, containerKey, object", function() {
  var p;
  p = new ProfileNode(1000, {view: { instrumentDisplay: 'donuts', _debugContainerKey: 'candy'}, object: 'coffee'});
  equal(p.name, 'donuts');
  p = new ProfileNode(1000, {view: {_debugContainerKey: 'candy'}, object:' coffee'});
  equal(p.name, 'candy');
  p = new ProfileNode(1000, {object:'coffee'});
  equal(p.name, 'coffee');
});
