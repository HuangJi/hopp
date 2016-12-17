var caminte = require('caminte'),
    Schema = caminte.Schema,
    config = {
         driver     : "redis",
         host       : "localhost",
         port       : "6379",
         database   : "test"
    };

var schema = new Schema(config.driver, config);

var Post = schema.define('Post', {
    title:     { type: schema.String,  limit: 255 },
    content:   { type: schema.Text },
    comment:   { type: schema.Text },
    params:    { type: schema.JSON },
    date:      { type: schema.Date,    default: Date.now },
    published: { type: schema.Boolean, default: false, index: true }
});

// simplier way to describe model
var User = schema.define('User', {
    name:         schema.String,
    bio:          schema.Text,
    approved:     schema.Boolean,
    joinedAt:     schema.Date,
    age:          schema.Number
});

var post = new Post();
// console.log(post);
post.save();



// Post.remove({where:{title:''}}, function(err) {

// });

Post.find({}, function (error, posts) {
    console.log(posts.length);
    posts.map(function (post) {
        post.destroy(function(error) {
            console.log('song!');
        });
    });
});