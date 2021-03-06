const express = require('express');
const router = express.Router();
const User = require('../../models/models').User;
const Post = require('../../models/models').Post;
const Tag = require('../../models/models').Tag;
const Community = require('../../models/models').Community;
const axios = require('axios');
const Promise = require('promise');


router.post('/post', (req, res) => {
  const tagModels = req.body.newTags.map((filter) => {
    return new Tag(
      {
        name: filter.toUpperCase()
      });
  });
  let savedTags;
  let newTags;
  Promise.all(tagModels.map((tag) => tag.save()))
  .then((values) => {
    newTags = values.map((v) => v._id);
    savedTags = newTags.concat(req.body.postTags);
    const newPost = new Post({
      content: req.body.postBody,
      createdAt: new Date(),
      createdBy: req.user._id,
      likes: [],
      tags: savedTags,
      comments: [],
      commentNumber: 0,
      community: req.user.currentCommunity,
      link: '',
      attachments: {
        name: '',
        url: '',
        type: ''
      }
    });
    return newPost.save();
  })
  .then((r) => {
    let posts = [];
    console.log(req.body);
    const filters = req.body.filters;
    let filter;
    if (filters.length > 0) {
      filter =  { tags: { $in: filters }, community: req.user.currentCommunity, createdAt: { $gte: new Date(req.body.lastRefresh) } };
    } else {
      filter = {community: req.user.currentCommunity, createdAt: { $gte: new Date(req.body.lastRefresh) }};
    }
    Post.find(filter)
    .sort({ createdAt: -1 })
    .populate('tags')
    .populate('comments')
    .populate('comments.createdBy')
    .populate('createdBy')
    .then((postArr) => {
      posts = postArr.map((postObj) => {
        return {
          postId: postObj._id,
          username: postObj.createdBy.fullName,
          pictureURL: postObj.createdBy.pictureURL,
          content: postObj.content,
          createdAt: postObj.createdAt,
          tags: postObj.tags,
          likes: postObj.likes,
          commentNumber: postObj.commentNumber,
          link: postObj.link,
          attachment: postObj.attachment,
          edited: postObj.edited,
          newMemberBanner: postObj.newMemberBanner,
          comments: []
        };
      });
      return Community.findById(req.user.currentCommunity);
    })
    .then((com) => {
      com.otherTags = com.otherTags.concat(newTags);
      return com.save();
    })
    .then((result) => {
      console.log('user', req.user);
      res.json({ posts: posts, lastRefresh: new Date(), otherTags: result.otherTags, postId: r._id, userComm: req.user.currentCommunity});
    })
    .catch((err) => {
      console.log('error in new post not aws refresh', err);
      res.json(err);
    });
  })
  .catch((err) => {
    console.log('got error', err);
    res.json({data: null});
  });
});

router.post('/editPost', (req, res) => {
  console.log('editing post', req.body);
  Post.findById(req.body.postId)
    .populate('tags')
    .populate('createdBy')
    .then((response) => {
      response.content = req.body.newPostBody;
      response.edited = true;
      return response.save();
    })
    .then((postObj) => {
      console.log('made it past populate', postObj);
      const send = {
        postId: postObj._id,
        username: postObj.createdBy.fullName,
        pictureURL: postObj.createdBy.pictureURL,
        content: postObj.content,
        createdAt: postObj.createdAt,
        tags: postObj.tags,
        likes: postObj.likes,
        commentNumber: postObj.commentNumber,
        link: postObj.link,
        attachment: postObj.attachment,
        comments: postObj.comments,
        edited: postObj.edited,
        newMemberBanner: postObj.newMemberBanner
      };
      res.json({success: true, editedPost: send});
    })
    .catch((err) => {
      console.log('error in edit post', err);
      res.json({success: false, editedPost: {}});
    });
});

router.post('/joinconversation', (req, res) => {
  res.json({success: req.body.postId});
});


router.post('/blurb', (req, res) => {
  User.findById(req.user._id)
         .then((response) => {
           response.blurb = req.body.blurbBody;
           response.isEdited = true;
           return response.save();
         })
         .then((user) => {
           res.json({success: true, user: user});
         })
         .catch((err) => {
           console.log(err);
           res.json({success: false});
         });
});

router.post('/tags', (req, res) => {
  User.findById(req.user._id)
         .then((response) => {
           response.tags = req.body.tagsArray;
           response.isEdited = true;
           return response.save();
         })
         .then((user) => {
           res.json({success: true, user: user});
         })
         .catch((err) => {
           console.log(err);
           res.json({success: false});
         });
});

router.post('/interests', (req, res) => {
  User.findById(req.user._id)
         .then((response) => {
           response.interests = req.body.interestsArray;
           response.isEdited = true;
           return response.save();
         })
         .then(() => {
           res.json({success: true});
         })
         .catch((err) => {
           console.log(err);
           res.json({success: false});
         });
});

router.post('/about', (req, res) => {
  let globalResponse = {};
  User.findById(req.user._id)
         .then((response) => {
           globalResponse = response;
           globalResponse.education.colleges = req.body.colleges;
           globalResponse.work = req.body.works;
           globalResponse.education.schools = req.body.schools;
           globalResponse.placesLived = req.body.placesLived;
           globalResponse.isEdited = true;
           if (req.body.colleges) {
             let addr;
             req.body.colleges.forEach((college) => {
              //  if (college.attendedFor === 'Undergraduate' && !addr) {
               addr = college.name.split(' ').join('+');
              //  }
             });
             const locationUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + addr + '&key=' + process.env.LOCATION_API;
             return axios.get(locationUrl);
           }
           return null;
         })
         .then((resp) => {
           if (resp) {
             const jsonResp = resp.data.results[0];
             globalResponse.location.college = [jsonResp.geometry.location.lng,
            jsonResp.geometry.location.lat];
           }
           if (req.body.placesLived.current) {
             const homeAddr = req.body.placesLived.current.split(' ').join('+');
             const locationHomeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + homeAddr + '&key=' + process.env.LOCATION_API;
             return axios.get(locationHomeUrl);
           }
           return null;
         })
         .then((respond) => {
           if (respond) {
             const jsonp = respond.data.results[0];
             globalResponse.location.homeTown = [jsonp.geometry.location.lng,
             jsonp.geometry.location.lat];
           }
           return globalResponse.save();
         })
          .then((savedUser) => {
            const opts = [
              { path: 'communities' },
              { path: 'currentCommunity' }
            ];
            return User.populate(savedUser, opts);
          })
         .then((user) => {
           res.json({success: true, user: user});
         })
         .catch((err) => {
           console.log(err);
           res.json({success: false});
         });
});

router.post('/contact', (req, res) => {
  let globalResponse;
  User.findById(req.user._id)
            .then((response) => {
              globalResponse = response;
              globalResponse.contact.email = req.body.email;
              globalResponse.contact.phones = req.body.phones;
              globalResponse.location = req.body.location;
              globalResponse.isEdited = true;
              return globalResponse.save();
            })
             .then((user) => {
               res.json({success: true, user: user});
             })
             .catch((err) => {
               console.log(err);
               res.json({success: false});
             });
});

router.post('/links', (req, res) => {
  User.findById(req.user._id)
         .then((response) => {
           response.links = req.body.linksArray;
           response.isEdited = true;
           return response.save();
         })
         .then((user) => {
           res.json({success: true, user: user});
         })
         .catch((err) => {
           console.log(err);
           res.json({success: false});
         });
});

router.post('/iscreated', (req, res) => {
  User.findById(req.user._id)
             .then((response) => {
               response.hasProfile = true;
               return response.save();
             })
            .then((userProfile) => {
              userProfile.populate('communities');
              res.json({success: true, data: userProfile});
            })
            .catch((err) => {
              console.log('in created', err);
              res.json({data: null});
            });
});

router.post('/tag', (req, res) => {
  const newTag = new Tag({
    owner: req.user.currentCommunity,
    name: req.body.tag
  });
  newTag.save()
  .then((response) => {
    Community.findById(req.user.currentCommunity)
        .then((community) => {
          community.otherTags.push(response._id);
          return community.save();
          // if (req.body.isDefault) {
          //   community.defaultTags.push(response._id);
          //   return community.save();
          // } else {
          //   community.otherTags.push(response._id);
          //   return community.save();
          // }
        })
        .then((response2) => {
          res.json({success: true, tag: response});
        })
        .catch((err) => {
          console.log('error 1 saving tag', err);
          res.json({success: false});
        });
  })
  .catch((e) => {
    console.log('error saving tag', e);
    res.json({success: false});
  });
});

module.exports = router;
