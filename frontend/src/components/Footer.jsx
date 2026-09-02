import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
      <div className='md:mx-10'>
          <div className='flex flex-col sm:grid sm:grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
              
         
          {/* ----------------- Left section  -------------- */}
          <div >
              <img className='mb-5 w-40' src={assets.logo} alt="" />
              <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio distinctio hic consectetur? Ex incidunt aliquid rem, optio iure, aspernatur sed illo reprehenderit, deserunt accusamus ab soluta assumenda cum ea reiciendis!</p>
          </div>
           {/* ----------------- center section  -------------- */}
          <div>
              <p className='text-xl font-medium mb-5'> Company</p>
              <ul className='flex flex-col gap-2 text-gray-600'>
                  <li>Home</li>
                  <li>About us</li>
                  <li>Contact us</li>
                  <li>Privacyy</li>
              </ul>
          </div>
           {/* ----------------- Right section  -------------- */}
          <div>
              <p className='text-xl font-medium mb-5'> GET IN TOUCH</p>
              <ul className='flex flex-col gap-2 text-gray-600'>
                  <li>padalochanmohanty28@gmail.com</li>
                  <li>78946366939</li>
              </ul>
              </div>
               </div>
          {/* ----------Copy right section */}
          <div>
              <hr />
              <p className='py-5 text-sm text-center text-semibold'>Copyright 2026@ Prescripto-All Right Reserved</p>
          </div>
    </div>
  )
}

export default Footer