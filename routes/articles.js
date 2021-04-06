const express = require('express');
const router = express.Router();
const db = require('../db/models');
const { check, validationResult } = require('express-validator');
const { asyncHandler, csrfProtection } = require('./utils');

const validateArticle = [
    check('content')
        .exists({checkFalsy:true})
        .withMessage('Come on tell us a story!!!!!!!')
]

const articleNotFoundError = (id) => {
    const err = Error(`Article with id of ${id} must have been lost in the Bermuda triangle!`);
    err.title = 'Article not found';
    err.status = 404;
    return err;
}










router.get('/', csrfProtection, asyncHandler (async (req, res, next) => {
    res.render('articles', {title: 'Read Articles'});
}))

router.get('/:id(\\d+)', csrfProtection, asyncHandler (async (req, res, next) => {
    const articleId = parseInt(req.params.id, 10);
    const article = await db.Article.findByPk(articleId);
    if (article) {
        res.json({article})
    } else {
        next(articleNotFoundError(articleId))
    }
}))

router.get('/create', csrfProtection, asyncHandler (async (req, res, next) => {
    res.render('create-article', {title: 'Write An Article!'})
}));

router.post('/create', csrfProtection, asyncHandler(async (req, res, next) => {
    const { content } = req.body;

    const article = await db.Article.create({
        content
    });
    const validatorErrors = validationResult(req);
    if(validatorErrors.isEmpty()){
        res.redirect('/:id')
        //NEED TO DISCUSS THIS REDIRECT. 
    } else{
        const errors = validatorErrors.array().map((error) => error.msg)
        res.render('create-article', {title: "Write An Article!", content, errors, csrfToken: req.csrfToken()})
    }
}));

router.put('/id(\\d+)', asyncHandler(async (req, res, next) => {
    const articleId = parseInt(req.params.id, 10);
    const article = await db.Article.findByPk(articleId);
    const validatorErrors = validationResult(req);
    if(validatorErrors.isEmpty()){
        await article.update({content: req.body.content});
        res.redirect('/:id')
    } else{
        const errors = validatorErrors.array().map((error) => error.msg)
        res.render('create-article', {title: "Write An Article!", content, errors, csrfToken: req.csrfToken()})
    }

}))


// content and pictures
// posting/creating
// editing
// deleting

// LIKES

module.exports = router;

