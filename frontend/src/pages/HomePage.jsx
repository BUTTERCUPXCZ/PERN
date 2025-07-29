import React, { use, useEffect } from 'react'
import { useProductStore } from '../store/useProductStore';
import { PackageIcon, PlusCircleIcon, RefreshCwIcon } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import AddProductModal from '../components/AddProductModal';

const HomePage = () => {
    const { products, loading, error, fetchProducts } = useProductStore();


    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);
    console.log("products", products);

    return (
        <main className='max-w-6xl mx-auto px-4 py-8 '>
            <div className='flex justify-between items-center mb-8'>
                <button className='btn btn-primary'
                    onClick={() => document.getElementById('add_product_modal').showModal()}
                >
                    <PlusCircleIcon className='size-5 mr-2' />
                    Add Products
                </button>
                <button className='btn btn-primary' onClick={fetchProducts}>
                    <RefreshCwIcon className='size-5 mr-2' />
                    Refresh
                </button>
            </div>

            <AddProductModal />


            {error && <div className='alert alert-error mb-8'>{error}</div>}

            {products.length === 0 && !loading && (
                <div className='flex flex-col justify-center items-center h-96 space-y-4'>
                    <div className='bg-base-100 rounded-full p-6'>
                        <PackageIcon className='size-12' />
                    </div>
                    <div>
                        <h3 className='text-2xl font-semibold'>No Products Found</h3>
                        <p className='text-gray-500'>Add some products to get started.</p>
                    </div>
                </div>
            )}




            {loading ? (
                <div className='flex justify-center items-center h-64'>
                    <div className='loading loading-spinner loading-lg' />
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}

                </div>
            )}
        </main>
    )
}

export default HomePage