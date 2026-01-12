import React from 'react';
import './style.css'
import { NavLink } from 'react-router-dom';
const NotFoundPage = ({type='Page'}) => {
  return (
    <section className="page_404 mt-30 lg:mt-30">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center ">
          <div className="w-full">
            <div className="w-5/6 mx-auto text-center">
              <div className="four_zero_four_bg">
                <h1 className="res-subheading  text-center">404</h1>
              </div>
              
              <div className="contant_box_404">
                <h3 className="res-subheading  text-center font-bold">
                  Look like you're lost
                </h3>
                
                <p className='college-descption text-[16px]'>the {type} you are looking for not avaible!</p>
                
                <NavLink to="/" className="link_404 bg-blue-500 rounded-2xl">Go to Home</NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;