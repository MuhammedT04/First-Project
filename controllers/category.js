const category = require("../model/category");
const Offer = require("../model/offer");

//category list

const categorylist = async (req, res) => {
  try {
    const categoryData = await category.find();
    const offer = await Offer.find();
    res.render("Admin/categoryList", { Data: categoryData, offer });
  } catch (error) {
    console.log(error.message);
  }
};

//category Add

const addcategory = async (req, res) => {
  try {
    res.render("Admin/categoryAdd");
  } catch (error) {
    console.log(error.message);
  }
};

const categoryAddData = async (req, res) => {
  try {
    const firstData = await category.findOne({
      name: { $regex: new RegExp(req.body.name, "i") },
    });

    if (!firstData) {
      const categoryData = new category({
        name: req.body.name,
        description: req.body.description,
      });
      const categoryDataSave = await categoryData.save();
      if (categoryDataSave) {
        res.redirect("/admin/Category");
      } else {
        res.redirect("/admin/AddCategory");
      }
    } else {
      res.render("Admin/categoryAdd", { error: "category already exists" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//category Edit

const categoryEdit = async (req, res) => {
  try {
    const Id = req.query.cid;
    const categorydatas = await category.findById({ _id: Id });
    if (categorydatas) {
      res.render("Admin/categoryEdit", { Data: categorydatas });
    } else {
      res.redirect("/admin/Category");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//category Edit Data

const categoryEditData = async (req, res) => {
  try {
    const editdata = await category.findOne({
      name: { $regex: new RegExp(req.body.name, "i") },
    });
    if (!editdata) {
      const UpdateData = await category.findByIdAndUpdate(
        { _id: req.body.cid },
        { $set: { name: req.body.name, description: req.body.description } }
      );
      res.redirect("/admin/Category");
    } else {
      req.flash("msg", "category already exists");
      const secdata = await category.findOne({ _id: req.body.cid });
      const msg = req.flash("msg");
      res.render("Admin/categoryEdit", { Data: secdata, msg });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//category Delete Date

const categoryDelete = async (req, res) => {
  try {
    const Id = req.query.cid;
    const DateChek = await category.deleteOne({ _id: Id });
    res.redirect("/admin/Category");
  } catch (error) {
    console.log(error.message);
  }
};

//Category Block

const categoryBlock = async (req, res) => {
  try {
    const Id = req.body.id;
    const catdata = await category.findOne({ _id: Id });
    catdata.status = !catdata.status;
    catdata.save();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  categorylist,
  addcategory,
  categoryAddData,
  categoryEdit,
  categoryEditData,
  categoryDelete,
  categoryBlock,
};
