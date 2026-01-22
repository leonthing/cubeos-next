// ==================================================
// 레시피 관리 페이지
// 재배 레시피 조회
// ==================================================

'use client';

import { useState, useEffect } from 'react';
import { recipeApi } from '@/lib/api';
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Leaf,
  Calendar,
  User,
  Tag,
  Clock,
  Layers,
} from 'lucide-react';

interface Recipe {
  recipeId: string;
  recipeCode: string;
  description: string;
  date: string;
  drafterId: string;
  plant?: {
    plantId: string;
    typeName: string;
    speciesName: string;
    seedName: string;
    vendor?: {
      name: string;
    };
  };
  recipeCategory?: {
    recipeCategoryId: string;
    name: string;
    description: string;
  };
  siteType?: {
    siteTypeId: string;
    name: string;
    description: string;
  };
  sequences?: {
    day: number;
    values: { id: string; value: string }[];
  }[];
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    try {
      const recipesRes = await recipeApi.getRecipes();
      const recipeList = recipesRes?.result || [];
      setRecipes(recipeList);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 카테고리 목록 추출
  const categories = [...new Set(recipes.map((r) => r.recipeCategory?.name).filter(Boolean))];

  // 검색 및 필터링
  const filteredRecipes = (recipes || []).filter((recipe) => {
    const matchesSearch =
      recipe.recipeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.plant?.seedName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || recipe.recipeCategory?.name === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // 총 재배일수 계산
  const getTotalDays = (recipe: Recipe) => {
    if (!recipe.sequences || recipe.sequences.length === 0) return 0;
    return recipe.sequences.reduce((sum, seq) => sum + seq.day, 0);
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner w-10 lg:w-12 h-10 lg:h-12"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">레시피 관리</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">
            재배 환경 레시피 설정 ({recipes.length}개)
          </p>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 lg:w-5 h-4 lg:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="레시피 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 lg:pl-10 pr-4 py-2 text-sm lg:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">모든 카테고리</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 레시피 목록 */}
      <div className="space-y-3">
        {filteredRecipes.map((recipe) => {
          const isExpanded = expandedRecipe === recipe.recipeId;
          const totalDays = getTotalDays(recipe);

          return (
            <div key={recipe.recipeId} className="card">
              {/* 헤더 */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedRecipe(isExpanded ? null : recipe.recipeId)}
              >
                <div className="flex items-center space-x-3 lg:space-x-4 min-w-0 flex-1">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm lg:text-base text-gray-900 truncate">{recipe.recipeCode}</h3>
                      {recipe.recipeCategory && (
                        <span className="px-1.5 lg:px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] lg:text-xs whitespace-nowrap">
                          {recipe.recipeCategory.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs lg:text-sm text-gray-500 mt-0.5 line-clamp-1">
                      {recipe.description || '설명 없음'}
                    </p>
                    {/* 모바일에서 보이는 추가 정보 */}
                    <div className="flex sm:hidden items-center gap-3 mt-1 text-xs text-gray-500">
                      {recipe.plant?.seedName && (
                        <span className="flex items-center">
                          <Leaf className="w-3 h-3 mr-0.5 text-green-500" />
                          {recipe.plant.seedName}
                        </span>
                      )}
                      {totalDays > 0 && (
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-0.5 text-blue-500" />
                          {totalDays}일
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
                  <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                    {recipe.plant?.seedName && (
                      <span className="flex items-center">
                        <Leaf className="w-4 h-4 mr-1 text-green-500" />
                        {recipe.plant.seedName}
                      </span>
                    )}
                    {totalDays > 0 && (
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-blue-500" />
                        {totalDays}일
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* 상세 정보 */}
              {isExpanded && (
                <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-100">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-3 lg:mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 lg:p-3">
                      <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                        <Tag className="w-3 lg:w-4 h-3 lg:h-4 text-gray-500" />
                        <span className="text-[10px] lg:text-xs text-gray-500">레시피 코드</span>
                      </div>
                      <p className="font-medium text-xs lg:text-base text-gray-900 truncate">{recipe.recipeCode}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 lg:p-3">
                      <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                        <Leaf className="w-3 lg:w-4 h-3 lg:h-4 text-green-500" />
                        <span className="text-[10px] lg:text-xs text-gray-500">작물</span>
                      </div>
                      <p className="font-medium text-xs lg:text-base text-gray-900 truncate">
                        {recipe.plant?.seedName || '-'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 lg:p-3">
                      <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                        <Layers className="w-3 lg:w-4 h-3 lg:h-4 text-blue-500" />
                        <span className="text-[10px] lg:text-xs text-gray-500">사이트 타입</span>
                      </div>
                      <p className="font-medium text-xs lg:text-base text-gray-900 truncate">
                        {recipe.siteType?.description || recipe.siteType?.name || '-'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 lg:p-3">
                      <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                        <Clock className="w-3 lg:w-4 h-3 lg:h-4 text-purple-500" />
                        <span className="text-[10px] lg:text-xs text-gray-500">재배 기간</span>
                      </div>
                      <p className="font-medium text-xs lg:text-base text-gray-900">
                        {totalDays > 0 ? `${totalDays}일` : '-'}
                      </p>
                    </div>
                  </div>

                  {/* 추가 정보 */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 mb-3 lg:mb-4">
                    <div className="bg-gray-50 rounded-lg p-2 lg:p-3">
                      <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                        <User className="w-3 lg:w-4 h-3 lg:h-4 text-gray-500" />
                        <span className="text-[10px] lg:text-xs text-gray-500">작성자</span>
                      </div>
                      <p className="font-medium text-xs lg:text-base text-gray-900 truncate">{recipe.drafterId || '-'}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-2 lg:p-3">
                      <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                        <Calendar className="w-3 lg:w-4 h-3 lg:h-4 text-gray-500" />
                        <span className="text-[10px] lg:text-xs text-gray-500">등록일</span>
                      </div>
                      <p className="font-medium text-xs lg:text-base text-gray-900">
                        {recipe.date ? new Date(recipe.date).toLocaleDateString('ko-KR') : '-'}
                      </p>
                    </div>

                    {recipe.plant?.vendor && (
                      <div className="bg-gray-50 rounded-lg p-2 lg:p-3">
                        <div className="flex items-center space-x-1 lg:space-x-2 mb-1">
                          <BookOpen className="w-3 lg:w-4 h-3 lg:h-4 text-gray-500" />
                          <span className="text-[10px] lg:text-xs text-gray-500">벤더</span>
                        </div>
                        <p className="font-medium text-xs lg:text-base text-gray-900 truncate">{recipe.plant.vendor.name}</p>
                      </div>
                    )}
                  </div>

                  {/* 시퀀스 정보 */}
                  {recipe.sequences && recipe.sequences.length > 0 && (
                    <div>
                      <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-3">
                        재배 시퀀스 ({recipe.sequences.length}단계)
                      </h4>
                      <div className="overflow-x-auto -mx-2 lg:mx-0 px-2 lg:px-0">
                        <table className="w-full text-[10px] lg:text-xs border-collapse min-w-[1200px] lg:min-w-[1600px]">
                          <thead>
                            <tr className="bg-gray-100">
                              <th rowSpan={2} className="px-2 py-2 text-center font-medium text-gray-600 border whitespace-nowrap">SEQUENCE<br/>Number</th>
                              <th rowSpan={2} className="px-2 py-2 text-center font-medium text-gray-600 border whitespace-nowrap">RUNNING<br/>Days</th>
                              <th colSpan={2} className="px-2 py-1 text-center font-medium text-yellow-700 bg-yellow-50 border">led</th>
                              <th colSpan={2} className="px-2 py-1 text-center font-medium text-cyan-700 bg-cyan-50 border">pump</th>
                              <th colSpan={4} className="px-2 py-1 text-center font-medium text-red-700 bg-red-50 border">temperature</th>
                              <th colSpan={4} className="px-2 py-1 text-center font-medium text-blue-700 bg-blue-50 border">humidity</th>
                              <th colSpan={4} className="px-2 py-1 text-center font-medium text-green-700 bg-green-50 border">co2</th>
                              <th colSpan={4} className="px-2 py-1 text-center font-medium text-amber-700 bg-amber-50 border">doser</th>
                              <th colSpan={4} className="px-2 py-1 text-center font-medium text-purple-700 bg-purple-50 border">ph</th>
                              <th colSpan={3} className="px-2 py-1 text-center font-medium text-indigo-700 bg-indigo-50 border">ec</th>
                              <th colSpan={2} className="px-2 py-1 text-center font-medium text-orange-700 bg-orange-50 border">waterTemp</th>
                            </tr>
                            <tr className="bg-gray-50 text-[10px]">
                              {/* LED */}
                              <th className="px-1 py-1 text-center text-yellow-600 border">onTime</th>
                              <th className="px-1 py-1 text-center text-yellow-600 border">offTime</th>
                              {/* Pump */}
                              <th className="px-1 py-1 text-center text-cyan-600 border">intervals</th>
                              <th className="px-1 py-1 text-center text-cyan-600 border">duration</th>
                              {/* Temperature */}
                              <th className="px-1 py-1 text-center text-red-600 border">min</th>
                              <th className="px-1 py-1 text-center text-red-600 border">offValue</th>
                              <th className="px-1 py-1 text-center text-red-600 border">onValue</th>
                              <th className="px-1 py-1 text-center text-red-600 border">max</th>
                              {/* Humidity */}
                              <th className="px-1 py-1 text-center text-blue-600 border">min</th>
                              <th className="px-1 py-1 text-center text-blue-600 border">offValue</th>
                              <th className="px-1 py-1 text-center text-blue-600 border">onValue</th>
                              <th className="px-1 py-1 text-center text-blue-600 border">max</th>
                              {/* CO2 */}
                              <th className="px-1 py-1 text-center text-green-600 border">min</th>
                              <th className="px-1 py-1 text-center text-green-600 border">offValue</th>
                              <th className="px-1 py-1 text-center text-green-600 border">onValue</th>
                              <th className="px-1 py-1 text-center text-green-600 border">max</th>
                              {/* Doser */}
                              <th className="px-1 py-1 text-center text-amber-600 border">a</th>
                              <th className="px-1 py-1 text-center text-amber-600 border">b</th>
                              <th className="px-1 py-1 text-center text-amber-600 border">ph_p</th>
                              <th className="px-1 py-1 text-center text-amber-600 border">ph_m</th>
                              {/* pH */}
                              <th className="px-1 py-1 text-center text-purple-600 border">min</th>
                              <th className="px-1 py-1 text-center text-purple-600 border">low</th>
                              <th className="px-1 py-1 text-center text-purple-600 border">high</th>
                              <th className="px-1 py-1 text-center text-purple-600 border">max</th>
                              {/* EC */}
                              <th className="px-1 py-1 text-center text-indigo-600 border">min</th>
                              <th className="px-1 py-1 text-center text-indigo-600 border">value</th>
                              <th className="px-1 py-1 text-center text-indigo-600 border">max</th>
                              {/* Water Temp */}
                              <th className="px-1 py-1 text-center text-orange-600 border">min</th>
                              <th className="px-1 py-1 text-center text-orange-600 border">max</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recipe.sequences.map((seq, idx) => {
                              // 시퀀스 값 파싱 (29개 값, brightness 없음)
                              // 순서: LED(onTime, offTime), Pump(intervals, duration),
                              //      Temp(min,offValue,onValue,max), Humid(min,offValue,onValue,max), CO2(min,offValue,onValue,max),
                              //      Doser(a,b,ph_p,ph_m), pH(min,low,high,max), EC(min,value,max), WaterTemp(min,max)
                              const v = seq.values?.map(item => parseFloat(item.value)) || [];

                              // LED 시간 변환 (분 -> HH:MM)
                              const formatTime = (minutes: number) => {
                                if (minutes === undefined || isNaN(minutes)) return '-';
                                const h = Math.floor(minutes / 60);
                                const m = minutes % 60;
                                return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
                              };

                              const formatVal = (val: number, decimals = 1) => {
                                if (val === undefined || isNaN(val)) return '-';
                                return val.toFixed(decimals);
                              };

                              return (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-2 py-1.5 border text-center font-medium">{idx + 1}</td>
                                  <td className="px-2 py-1.5 border text-center">{seq.day}</td>
                                  {/* LED (v[0], v[1]) */}
                                  <td className="px-1 py-1.5 border text-center text-yellow-700">{formatTime(v[0])}</td>
                                  <td className="px-1 py-1.5 border text-center text-yellow-700">{formatTime(v[1])}</td>
                                  {/* Pump (v[2], v[3]) */}
                                  <td className="px-1 py-1.5 border text-center text-cyan-700">{formatVal(v[2], 0)}</td>
                                  <td className="px-1 py-1.5 border text-center text-cyan-700">{formatVal(v[3], 0)}</td>
                                  {/* Temperature (v[4]-v[7]) */}
                                  <td className="px-1 py-1.5 border text-center text-red-600">{formatVal(v[4])}</td>
                                  <td className="px-1 py-1.5 border text-center text-red-600">{formatVal(v[5])}</td>
                                  <td className="px-1 py-1.5 border text-center text-red-600">{formatVal(v[6])}</td>
                                  <td className="px-1 py-1.5 border text-center text-red-600">{formatVal(v[7])}</td>
                                  {/* Humidity (v[8]-v[11]) */}
                                  <td className="px-1 py-1.5 border text-center text-blue-600">{formatVal(v[8])}</td>
                                  <td className="px-1 py-1.5 border text-center text-blue-600">{formatVal(v[9])}</td>
                                  <td className="px-1 py-1.5 border text-center text-blue-600">{formatVal(v[10])}</td>
                                  <td className="px-1 py-1.5 border text-center text-blue-600">{formatVal(v[11])}</td>
                                  {/* CO2 (v[12]-v[15]) */}
                                  <td className="px-1 py-1.5 border text-center text-green-600">{formatVal(v[12], 0)}</td>
                                  <td className="px-1 py-1.5 border text-center text-green-600">{formatVal(v[13], 0)}</td>
                                  <td className="px-1 py-1.5 border text-center text-green-600">{formatVal(v[14], 0)}</td>
                                  <td className="px-1 py-1.5 border text-center text-green-600">{formatVal(v[15], 0)}</td>
                                  {/* Doser (v[16]-v[19]) */}
                                  <td className="px-1 py-1.5 border text-center text-amber-600">{formatVal(v[16])}</td>
                                  <td className="px-1 py-1.5 border text-center text-amber-600">{formatVal(v[17])}</td>
                                  <td className="px-1 py-1.5 border text-center text-amber-600">{formatVal(v[18])}</td>
                                  <td className="px-1 py-1.5 border text-center text-amber-600">{formatVal(v[19])}</td>
                                  {/* pH (v[20]-v[23]) */}
                                  <td className="px-1 py-1.5 border text-center text-purple-600">{formatVal(v[20])}</td>
                                  <td className="px-1 py-1.5 border text-center text-purple-600">{formatVal(v[21])}</td>
                                  <td className="px-1 py-1.5 border text-center text-purple-600">{formatVal(v[22])}</td>
                                  <td className="px-1 py-1.5 border text-center text-purple-600">{formatVal(v[23])}</td>
                                  {/* EC (v[24]-v[26]) */}
                                  <td className="px-1 py-1.5 border text-center text-indigo-600">{formatVal(v[24])}</td>
                                  <td className="px-1 py-1.5 border text-center text-indigo-600">{formatVal(v[25])}</td>
                                  <td className="px-1 py-1.5 border text-center text-indigo-600">{formatVal(v[26])}</td>
                                  {/* Water Temp (v[27]-v[28]) */}
                                  <td className="px-1 py-1.5 border text-center text-orange-600">{formatVal(v[27])}</td>
                                  <td className="px-1 py-1.5 border text-center text-orange-600">{formatVal(v[28])}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 설명 */}
                  {recipe.description && (
                    <div className="mt-3 lg:mt-4 p-2 lg:p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs lg:text-sm text-gray-700">{recipe.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12 lg:py-16 text-gray-500">
            <BookOpen className="w-12 lg:w-16 h-12 lg:h-16 mx-auto mb-3 lg:mb-4 text-gray-300" />
            <p className="text-base lg:text-lg">
              {searchTerm || categoryFilter !== 'all'
                ? '검색 결과가 없습니다'
                : '등록된 레시피가 없습니다'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
