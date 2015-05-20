Router.configure({
  layoutTemplate: 'main',
  notFoundTemplate: 'notFound'
});

Router.map( function() {
    this.route('home', {
    	path: '/'
    });
    this.route('map', {
    	path: '/home'
    });
    this.route('about', {
    	path: '/about'
    });
    this.route('draw', {
    	path: '/draw'
    });
    this.route('admin', {
        path: '/admin'
    });
    this.route('support', {
        path: '/support'
    });
    this.route('faqs', {
        path: '/faqs'
    });
    this.route('agreement', {
        path: '/agreement'
    });
});
