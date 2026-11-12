const Note = require('../models/notes')
const mongoose = require('mongoose')

const getNotes = async(req, res) => {
    try {
        const notes = await Note.find({}).sort({createdAt: -1})
        res.status(200).json(notes)
    } catch (error) {
        res.status(500).json({error: 'Unable to load notes'})
    }
}

const getSingleNote = async(req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
         return res.status(404).json({error: "Can't find note"})
    }

    const note = await Note.findById(id)

    if(!note){
        return res.status(404).json({error: "Can't find note"})
    }

    res.status(200).json(note)
}

const createNote = async(req, res) => {
    const {title, description, user} = req.body
    
    try {
        const note = await Note.create({title, description, user})
        res.status(200).json(note)

    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

const deleteNote = async(req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "Can't find note"})
    }

    const note = await Note.findOneAndDelete({_id: id})

    if(!note){
        return res.status(404).json({error: "Can't find note"})
    }

    res.status(200).json(note)

}

const updateNote = async(req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "Can't find note"})
    }

    const note = await Note.findOneAndUpdate({_id: id}, {
        ...req.body
    }, { new: true, runValidators: true })

    if(!note){
        return res.status(404).json({error: "Can't find note"})
    }

    res.status(200).json(note)
}

module.exports = {getNotes, getSingleNote, createNote, deleteNote, updateNote};