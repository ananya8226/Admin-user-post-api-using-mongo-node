const { Types } = require('mongoose')

const create = async (Model, profile) => {
  try {
    const data = new Model(profile).save()
    return data
  } catch (err) {
    return false
  }
}

const updateByCondition = async (Model, condition, content) => {
  try {
    const data = await Model.updateOne(condition, { $set: content })
    return data || null
  } catch (err) {
    return false
  }
}

const getById = async (Model, _id) => {
  try {
    const data = await Model.findById(_id).lean()
    return data
  } catch (error) {
    return false
  }
}

const getByCondition = async (Model, condition) => {
  try {
    const data = await Model.findOne(condition).lean()
    return data || null
  } catch (error) {
    return false
  }
}

const removeById = async (Model, id) => {
  try {
    const data = await Model.findByIdAndRemove(id)
    return data
  } catch (error) {
    return false
  }
}

const updateById = async (Model, id, profile) => {
  try {
    const data = await Model.findByIdAndUpdate(
      Types.ObjectId(id),
      { $set: profile },
      { new: true }
    )
    return data
  } catch (error) {
    return false
  }
}

const insertManyData = async (Model, content) => {
  try {
    const data = Model.insertMany(content).lean()
    return data || null
  } catch (err) {
    return false
  }
}

const deleteByField = async (Model, content) => {
  try {
    const data = await Model.findOneAndRemove(content).lean()
    return data || null
  } catch (error) {
    return false
  }
}

const count = async (Model, condition) => {
  try {
    const data = await Model.countDocuments(condition).lean()
    return data || 0
  } catch (error) {
    return false
  }
}

const getManyByCondition = async (Model, condition, sortCondition, skip, limit, attr) => {
  try {
    const data = await Model.find(condition, attr).sort(sortCondition).skip(skip).limit(limit).lean()
    return data
  } catch (error) {
    return false
  }
}

const getMany = async (Model, condition, attr) => {
  try {
    const data = await Model.find(condition, attr).lean()
    return data
  } catch (error) {
    return false
  }
}

const updateCountByCondition = async (Model, condition, count) => {
  try {
    const data = await Model.updateOne(
      condition,
      { $inc: count },
      { new: true }
    )
    return data
  } catch (error) {
    return false
  }
}

const deleteByCondition = async (Model, condition) => {
  try {
    const data = await Model.findByIdAndRemove(condition)
    return data
  } catch (error) {
    return false
  }
}

const updateManyByCondition = async (Model, condition, content) => {
  try {
    const data = await Model.updateMany(condition, { $set: content })
    return data
  } catch (err) {
    return false
  }
}

module.exports = {
  create,
  updateByCondition,
  getById,
  removeById,
  updateById,
  count,
  insertManyData,
  deleteByField,
  getByCondition,
  getManyByCondition,
  updateCountByCondition,
  deleteByCondition,
  updateManyByCondition,
  getMany
}
