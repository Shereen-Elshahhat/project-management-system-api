export class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //mongoose query ex: Project.find()
    this.queryString = queryString; //parameters object ex: req.query
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields", "search"];
    excludeFields.forEach((el) => delete queryObj[el]);
    
    Object.keys(queryObj).forEach((key) => {
      const value = queryObj[key];

      // Exact matching for enum fields (status, role)
      if (["status", "role"].includes(key)) {
        return;
      }

      // If the field is a string and NOT an ObjectId then apply regex
      if (
        typeof value === "string" &&
        !/^[0-9a-fA-F]{24}$/.test(value) // Avoid turning ObjectIds into regex strings
      ) {
        queryObj[key] = { $regex: value, $options: "i" };
      }
    });

    // converts operators like gte to mongoose $gte syntax

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(fields = []) {
    if (this.queryString.search && fields.length > 0) {
      const keyword = this.queryString.search;
      const querySearch = {
        $or: fields.map((field) => ({
          [field]: { $regex: keyword, $options: "i" },
        })),
      };
      this.query = this.query.find(querySearch);
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      //defualt filtering
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
