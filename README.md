#Nano Titanium

A simple data-binding library for Appcelerator's Alloy framework for Titanium.

##Install

Just type the following from the root of your existing alloy project.

~~~
$ npm install ti-nano
~~~

It will copy all the required libraries to your `app/lib` folder.

##Setup

- [ ] TODO: build an alloy hook to skip all this.

Add the following to the beginning of your controller:

~~~
var nano = require("nano");
~~~

Create an object you want to bind against, e.g.

~~~
var $model = {
  person: {
    first: "David",
    last: "Bankier"
  },
  field:"asdf"
};
~~~

Then add the following to the end of your controller.

~~~
nano($,$model);
~~~

The object can really be any POJO, e.g. you can use args

~~~
var args = arguments[0];
nano($,args);
~~~

N.B. using `this` is not really recommended.

##Binding

Binding is two-way by default. So any changes in the view is reflected in the model and vice-versa.

Unfortunately Alloy has already taken curly brackets for binding attributes.
For the moment the syntax is `-= myAttribute =-`. (Likely to change, I'll take suggestions.)

### Simple Cases

That aside you can bind against view properties like this:

~~~
<Alloy>
	<Window class="container">
    <View top="100" layout="vertical">
      <TextField value="-=person.first=-"></TextField>
      <Label>-=person.first=-</Label>
    </View>
	</Window>
</Alloy>
~~~

You can also bind multiple values as follows.

~~~
<Alloy>
	<Window class="container">
    <View top="100" layout="vertical">
      <TextField value="-=person.first=-"></TextField>
      <TextField value="-=person.last=-"></TextField>
      <Label>Hello, -=person.first=- -=person.last=-</Label>
    </View>
	</Window>
</Alloy>
~~~

### expression

Binding also be against expression.

~~~
<Alloy>
	<Window class="container">
    <View top="100" layout="vertical">
      <TextField value="-=person.first=-"></TextField>
      <TextField value="-=person.last=-"></TextField>
      <Label>Hello, -=person.first=- -=person.last=-, length: -=person.last.length=-</Label>

      <TextField value="-=field=-"></TextField>
      <Label>Length: -=field.length=-</Label>
    </View>
	</Window>
</Alloy>
~~~

You can bind with any js expression that can be evaluated and against any
view property. Here is a validation example.

~~~
<Alloy>
	<Window class="container">
    <View top="100" layout="vertical">
      <TextField value="-=person.first=-"></TextField>
      <TextField value="-=person.first=-"></TextField>
      <TextField value="-=person.last=-" color="-= person.last.length < 4 ? 'red' : 'black' =-"></TextField>
      <Label text="-=person.last.length < 4 ? 'last name too short' : ''=-"></Label>
    </View>
	</Window>
</Alloy>
~~~

### One-Way binding

You can use the `oneway` attribute if you want force one-way binding 

~~~
<Alloy>
	<Window class="container">
    <View top="100" layout="vertical">
      <TextField value="-=person.first=-"></TextField>
      <TextField value="-=person.last=-" color="-= person.last.length < 4 ? 'red' : 'black' =-"></TextField>
      <TextField value="-=person.last=-" oneway></TextField>
    </View>
	</Window>
</Alloy>
~~~

### Changes in the controller.

Until we have `Object.observe` support, if you make changes in the controller to the `$model` then you
need to call the following command to trigger the updates to all bound views.

~~~
  nano.apply();
~~~

##Roadmap/ToDo

- [ ] alloy plugin to automate nano binding on all controllers
- [ ] repeaters
- [ ] improve performance
- [ ] automate tests with [tishadow](https://github.com/dbankier/tishadow)

##Under The Hood

It uses Polymer's [object-js](https://github.com/polymer/observe-js) to fill in the gaps
until we get `Object.observe` in Titanium.

##Why

This was originally motivated by seeing [this](http://beautyindesign.com/blog/uber-simple-idea-for-alloy-view-data-binding/) by @rblalock.

I rarely use backbone models built-in to Alloy. Also having been spoilt by the data-binding
options for web-developers I find the data-binding built into Alloy limited and overly complicated.

