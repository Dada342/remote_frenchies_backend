var express = require('express');
var router = express.Router();

const User = require('../models/users');
const Proposition = require('../models/proposition');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

router.post('/proposition', (req, res) => {
    // Destructuration du code
    const {
        main_address,
        welcome_day,
        reception_hours,
        fiber_connection,
        coffee_tea,
        dedicated_office,
        other,
        description,
        token
    } = req.body;
    //user.find req.body.token


    User.findOne({ token }).then(user => { 
        if (!user) { console.log( req.body)
            return res.json({ result: false, error: 'User not found' });
        } else { 
        
            // Vérifier si une proposition avec les mêmes détails existe déjà pour l'utilisateur
            Proposition.findOne({ 
                main_address: { street: req.body.main_address },
                welcome_day,
                reception_hours,
                fiber_connection,
                coffee_tea,
                dedicated_office,
                other,
                description,
            }) 
                .then(existingProposition => {  
                    if (existingProposition) {
                        // erreur si proposition existante
                        res.json({ result: false, error: 'Proposition already exists' });
                    } else { 
                        // Creation nouvelle proposition
                        const newProposition = new Proposition({ 
                            
                            user: user._id,
                            main_address: { street: main_address },
                            welcome_day,
                            reception_hours,
                            fiber_connection,
                            coffee_tea,
                            dedicated_office,
                            other,
                            description,
                        }); 
                        // Save nouvelle proposition
                        newProposition.save()
                            .then(savedProposition => { 
                                // Mettre à jour le champ de proposition de l'utilisateur avec l'ID de la nouvelle proposition
                                User.findByIdAndUpdate(User._id, { propositions: savedProposition._id })
                                    .then(() => {
                                        // nouvelle proposition saved
                                        res.json({ result: true, proposition: savedProposition });
                                    })
                            })
                    }
                })
        }
    });
});


router.post('/upload', async (req, res) => {
    console.log("infos:", req.files.photoFromFront)
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.photoFromFront.mv(photoPath);

    if (!resultMove) {
        const resultCloudinary = await cloudinary.uploader.upload(photoPath);
        res.json({ result: true, url: resultCloudinary.secure_url });
    } else {
        res.json({ result: false, error: resultMove });
    }
    fs.unlinkSync(photoPath);
});


module.exports = router;














