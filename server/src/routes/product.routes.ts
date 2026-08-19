import { Router } from 'express';
import { getProducts, getProductBySlug, getSearchSuggestions } from '../controllers/product.controller.js';
import { getCategories, getBrands, getSkinTaxonomies } from '../controllers/category.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/taxonomies', getSkinTaxonomies);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/:slug', getProductBySlug);

export default router;
