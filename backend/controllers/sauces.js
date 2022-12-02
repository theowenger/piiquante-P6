const Sauce = require('../models/sauce');
const fs = require('fs');


exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    console.log(req.params);
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            console.log(sauce)
            res.status(200).json(sauce)
        })
        .catch(error => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    console.log(sauce)
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
        .catch(error => { res.status(400).json({ error }) })
}

exports.modifySauce = async (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    const sauce = await Sauce.findOne({ _id: req.params.id })
    if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    if (req.file) {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => { });
    }
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
        .catch(error => res.status(401).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' })
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: "Sauce Supprimée !" }) })
                        .catch(error => res.status(401).json({ error }))
                })
            }
        })
        .catch(error => {
            res.status(500).json({ error })
        })
};

exports.likeSauce = (req, res) => {
    const userId = req.body.userId;
    const sauceId = req.params.sauceId;
    const likeState = req.body.like;

    Sauce.findById(sauceId).then(sauce => {
        switch (likeState) {
            case 1:

                // Vérifier que l'utilisateur a déja liké
                if (sauce.usersLiked.includes(userId)) {
                    res.status(200).json({ message: "Vous avez déjà liké" })
                    break;
                }

                // Vérifier que l'utilisateur a pas déja disliké
                if (sauce.usersDisliked.includes(userId)) {
                    res.status(200).json({ message: "Vous avez déjà disliké" })
                    break;
                }

                sauce.likes++;
                sauce.usersLiked.push(userId)

                sauce.save().then(saved => {
                    res.status(200).json({ message: 'Like ajouté à la sauce!' })
                }).catch(e => {
                    res.status(500)
                })
                break;

            case 0:
                console.log('on veut annuler');
                // Vérifier que l'utilisateur a déja liké
                if (sauce.usersLiked.includes(userId)) {
                    sauce.likes--;
                    const index = sauce.usersLiked.findIndex(a => a == userId)

                    sauce.usersLiked.splice(index, 1)

                    sauce.save().then(saved => {
                        res.status(200).json({ message: 'Like enlevé !' })
                    }).catch(e => {
                        res.status(500)
                    })
                    break;
                }

                // Vérifier que l'utilisateur a pas déja disliké
                if (sauce.usersDisliked.includes(userId)) {
                    sauce.dislikes--;
                    const index = sauce.usersDisliked.findIndex(a => a == userId)

                    sauce.usersDisliked.splice(index, 1)

                    sauce.save().then(saved => {
                        res.status(200).json({ message: 'dislike enlevé!' })
                    }).catch(e => {
                        res.status(500)
                    })
                    break;
                }
                break;
            case -1:
                // Vérifier que l'utilisateur a déja liké
                if (sauce.usersLiked.includes(userId)) {
                    res.status(200).json({ message: "Vous avez déjà liké" })
                    break;
                }

                // Vérifier que l'utilisateur a pas déja disliké
                if (sauce.usersDisliked.includes(userId)) {
                    res.status(200).json({ message: "Vous avez déjà disliké" })
                    break;
                }

                sauce.dislikes++;
                sauce.usersDisliked.push(userId)

                sauce.save().then(saved => {
                    res.status(200).json({ message: 'DisLike ajouté à la sauce!' })
                }).catch(e => {
                    res.status(500)
                })
                break;

        }
    }).catch(() => {
        res.status(404)
    })

}