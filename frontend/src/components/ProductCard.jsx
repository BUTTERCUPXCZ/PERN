import { EditIcon, Trash2Icon } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';


const ProductCard = ({ product }) => {
    const { deleteProduct } = useProductStore();

    return (
        <div className='card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300'>
            <figure className='relative pt-[56.25%]'>
                <img
                    src={product.image}
                    alt={product.name}
                    className='absolute top-0o w-full h-full object-cover'
                />
            </figure>
            <div className="card-body">
                <h2 className='card-title text-lg font-semibold'>{product.name}</h2>
                <p className='text-2xl font-bold text-primary'>{Number(product.price).toFixed(2)}</p>

                <div className='card-actions justify-end mt-4'>
                    <Link to={`/product/${product.id}`} className='btn btn-primary'>
                        <EditIcon className='size-5 ' />
                    </Link>

                    <button className='btn btn-sm btn-error btn-outline'
                        onClick={() => deleteProduct(product.id)}
                    >
                        <Trash2Icon className='size-5' />
                    </button>

                </div>
            </div>
        </div>
    )
}

export default ProductCard