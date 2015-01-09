#Nano Titanium

A simple two-way data-binding library for Appcelerator's Alloy framework for Titanium.

##Install

From the root of your existing alloy project you can either.

Install using [gitto](http://gitt.io/)

~~~
$ gittio install nano
~~~

or install using npm

~~~
$ npm install ti-nano
~~~

It will copy all the required libraries to your `app/lib` folder.

##Setup

Add the following to the beginning of your controller:

~~~
var nano = require("nano");
nano.syntax(/\-\=(.+?)\=\-/gi);
~~~

For an explanation of the `syntax` command see the binding section.

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

The default syntax is `{{ attribute }}`. Currently there is a limitation in Alloy that prevents its usage.
See [this issue](https://github.com/dbankier/nano/issues/1).
The default syntax can be changed using the `nano.syntax` command.

For the examples below the follow command was used to change the syntax:

~~~
nano.syntax(/\-\=(.+?)\=\-/gi);
~~~

This changes the syntax `-= attribute =-`. 

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

##Building from Source

Building the distributable is done using [grunt](http://gruntjs.com/)

Enter the following:

~~~
$ npm install
$ grunt
~~~

The built library is found in at `dist/nano.js`

##Under The Hood

It uses Polymer's [object-js](https://github.com/polymer/observe-js) to fill in the gaps
until we get `Object.observe` in Titanium.

##Why

This was originally motivated by seeing [this](http://beautyindesign.com/blog/uber-simple-idea-for-alloy-view-data-binding/) by @rblalock.

I rarely use backbone models built-in to Alloy. Also having been spoilt by the data-binding
options for web-developers I find the data-binding built into Alloy limited and overly complicated.

