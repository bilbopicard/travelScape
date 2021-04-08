var express = require('express');
var router = express.Router();

const db = require('../db/models');
const { User, Article, PenPal, Comment } = db;
const { check, validationResult } = require('express-validator');
const { loginUser, logoutUser, requireAuth } = require('../auth');
const { asyncHandler, csrfProtection } = require('./utils');

const profileNotFoundError = (id) => {
    const err = Error('User profile not found');
    err.title = 'Profile not found =(';
    err.status = 404;
    return err;
}

router.get('/:id(\\d+)', requireAuth, csrfProtection, asyncHandler(async (req, res, next) => {
    const loggedIn = req.session.auth.userId;
    const userId = parseInt(req.params.id, 10);
    const user = await User.findByPk(userId, {
        include: [{
            model: User,
            as: 'followers'
        }, 
        {model: Article, include: Comment}
        ]
    })
    // console.log(user.Articles[0])
    const penPalCount = user.followers.length
    user.Articles.forEach(article => {
        let substring = article.content.substring(0, 200);
        article.content = substring
    })

    if (user) {

        res.render('profile', { user, csrfToken: req.csrfToken(), penPalCount, loggedIn })

    } else {
        next(profileNotFoundError(userId));
    }
}))

router.get('/:id(\\d+)/penpals', requireAuth, csrfProtection, asyncHandler(async (req, res, next) => {
    const loggedIn = req.session.auth.userId;
    const userId = parseInt(req.params.id, 10);
    // const user = await User.findOne({ 
    //     where: userId , 
    //     include: PenPal 
    //  });
    const user = await User.findByPk(userId, {
        include: [{
            model: User,
            as: 'followers'
        }]
    })

    const penPalCount = user.followers.length
    //  const penpals = user.followers.map(user => user.pen_name)
    if (user) {
        res.render('penPals', { user, csrfToken: req.csrfToken(), penPalCount, loggedIn})
    } else {
        next(profileNotFoundError(userId));
    }
}))

router.post('/logout', asyncHandler(async (req, res) => {
    logoutUser(req, res);
    res.redirect('/');
}))

module.exports = router;