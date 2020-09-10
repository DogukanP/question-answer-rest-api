const path = require("path");
const root = path.dirname(require.main.filename);

const asyncErrorWrapper = require("express-async-handler");

const {
    
    searchHelper,
    populateHelper,
    questionSortHelper,
    paginationHelper

} = require("./queryMiddlewareHelper");

const questionQueryMiddleware = function(model,options){
    return asyncErrorWrapper(async function(req,res,next) {
        // Initial Query
        let query = model.find({});

        // Search Parameter
        query = searchHelper("title",query,req);
        
        // Populate If Available
        
        if (options && options.population) {
            query = populateHelper(query,options.population);
        }

        // Sort Question

        query = questionSortHelper(query,req);

        let pagination;

        // Paginate Question

        const paginationResult = await paginationHelper(model,query,req);

        query = paginationResult.query;

        pagination = paginationResult.pagination;
        
        const advanceQueryResults = await query;
        console.log(pagination);
        
        res.advanceQueryResults = {
            success : true,
            count : advanceQueryResults.length,
            pagination : pagination,
            data : advanceQueryResults
        };
        next();
    })
}; 

module.exports = questionQueryMiddleware;